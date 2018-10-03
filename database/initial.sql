-- RESET FULL BE CAREFUL USING THIS (SCORCHED EARTH APPROACH!)
-- DROP SCHEMA IF EXISTS app_public, app_private CASCADE

-- RESET INDIVIDUAL
-- REASSIGN OWNED BY app_authorized TO postgres;
-- DROP OWNED BY app_authorized;
-- -- repeat the above commands in each database of the cluster
-- DROP ROLE app_authorized;

-- REASSIGN OWNED BY app_anonymous TO postgres;
-- DROP OWNED BY app_anonymous;
-- -- repeat the above commands in each database of the cluster
-- DROP ROLE app_anonymous;

-- REASSIGN OWNED BY app_user TO postgres;
-- DROP OWNED BY app_user;
-- -- repeat the above commands in each database of the cluster
-- DROP ROLE app_user;

-- DROP Extension "pgcrypto";

-- DROP Function app_public.current_user;
-- DROP Function app_public.register_user;
-- DROP Function app_public.authenticate;
-- DROP Type app_public.jwt_token;
-- DROP Table app_private.user_3P_auth;
-- DROP Table app_private.user_account;
-- DROP Table app_public.user;
-- DROP Function app_private.set_modified_on;
-- DROP Type app_private.account_status;
-- DROP Type app_private.auth_partner;

-- DROP SCHEMA IF EXISTS app_public, app_private RESTRICT

-- CREATE

CREATE Schema app_public;
CREATE Schema app_private;

-- After Schema creation and before function creation
ALTER DEFAULT PRIVILEGES REVOKE Execute ON Functions from public;

CREATE Role app_user login password 'DataSpectre';
CREATE Role app_anonymous;
CREATE Role app_authorized;
											  
GRANT app_anonymous TO app_user;
GRANT app_authorized TO app_user;

CREATE Table app_public.user (
	user_id          serial primary key,
	first_name       varchar(100),
	last_name        varchar(100),
	created_on       timestamp with time zone default now(),
	modified_on 	 timestamp with time zone default now()
);

CREATE Type app_private.account_status as enum (
	'active',
	'disabled',
	'deleted'
);

CREATE Table app_private.user_account (
	user_id    	    integer primary key references app_public.user(user_id) on delete cascade,
	primary_email   varchar(100) unique check (primary_email ~* '^.+@.+\..+$'),
	username 		varchar(50) null,
	password_hash 	text not null,
	status			app_private.account_status default 'active',
	created_on 		timestamp with time zone default now(),
	modified_on 	timestamp with time zone default now()
);

CREATE Type app_private.auth_partner as enum (
	'Facebook',
	'Twitter',
	'Instagram'
);

CREATE Table app_private.user_3P_auth (
	user_id 		integer references app_public.user(user_id) on delete cascade,
	client_id		text,
	email			varchar(100) unique check (email ~* '^.+@.+\..+$'),
	auth_partner	app_private.auth_partner,
	created_on 		timestamp with time zone default now(),
	modified_on 	timestamp with time zone default now(),
	PRIMARY KEY (user_id, auth_partner)
);

CREATE Function app_private.set_modified_on() returns trigger as $$
BEGIN
  new.modified_on := current_timestamp;
  return new;
END;
$$ language plpgsql;

CREATE Trigger user_updated_on before update
  on app_public.user
  for each row
  execute procedure app_private.set_modified_on();

CREATE Trigger user_account_updated_on before update
  on app_private.user_account
  for each row
  execute procedure app_private.set_modified_on();
  
CREATE Trigger user_3P_auth_updated_on before update
  on app_private.user_3P_auth
  for each row
  execute procedure app_private.set_modified_on();

CREATE Extension if not exists "pgcrypto";

CREATE Function app_public.register_user(
  first_name text,
  last_name text,
  email text,
  password text, 
  client_id text default null,
  auth_partner app_private.auth_partner default null
) returns app_public.user as $$
DECLARE
  newuser app_public.user;
BEGIN
  Insert Into app_public.user (first_name, last_name) 
  Values (first_name, last_name)
  Returning * into newuser;

  Insert Into app_private.user_account (user_id, primary_email, username, password_hash) 
  Values (newuser.user_id, email, email, crypt(password, gen_salt('bf') ) );
											  
  IF client_id IS NOT NULL THEN
	Insert into app_private.user_3P_auth (user_id, client_id, email, auth_partner)
	Values (newuser.user_id, client_id, email, auth_partner);
  END IF;

  RETURN newuser;
END;
$$ LANGUAGE plpgsql STRICT SECURITY DEFINER;
COMMENT ON Function app_public.register_user(text, text, text, text, text, app_private.auth_partner) IS 'Registers a single user and creates an account in our forum.';

CREATE Type app_public.jwt_token as (
  role text,
  user_id integer
);

CREATE Function app_public.authenticate(
  username text, -- this would be email really because that's what it's defaulted to in register_user
  password text
) RETURNS app_public.jwt_token as $$
DECLARE
  account app_private.user_account;
BEGIN
  Select a.* Into account
  From app_private.user_account as a
  Where a.username = $1;

  if account.password_hash = crypt(password, account.password_hash) then
    return ('app_authorized', account.user_id)::app_public.jwt_token;
  else
    return null;
  end if;
END;
$$ LANGUAGE plpgsql STRICT SECURITY DEFINER;
COMMENT ON Function app_public.authenticate(text, text) IS 'Creates a JWT token that will securely identify a user and give them certain permissions.';

CREATE Function app_public.current_user() returns app_public.user as $$
  Select *
  From app_public.user
  Where user_id = current_setting('jwt.claims.user_id')::integer
$$ LANGUAGE SQL STABLE;
COMMENT ON Function app_public.current_user() IS 'Gets the person who was identified by our JWT.';

GRANT Usage ON Schema app_public TO app_anonymous, app_authorized;
GRANT Usage ON Schema app_private TO app_authorized;

GRANT Select ON Table app_public.user TO app_anonymous, app_authorized;
GRANT Update, Delete ON Table app_public.user TO app_authorized;

GRANT Execute ON Function app_public.authenticate(text, text) TO app_anonymous, app_authorized;
GRANT Execute ON Function app_public.current_user() TO app_anonymous, app_authorized;
GRANT Execute ON Function app_public.register_user(text, text, text, text, text, app_private.auth_partner) TO app_anonymous;



								
											  
											  
											 

