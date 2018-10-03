export const checkValidity = (value, rules) => {
  let isValid = true;

  if (value !== undefined && value !== '') {

    if (rules.required) {
      if (value instanceof Array) {
        isValid = value.length > 0;
      } else if (value instanceof Date) {
        isValid = value instanceof Date;
      } else {
        if ( rules.isNumeric || rules.minVal || rules.maxVal ) {
          value = +value
        } else {
          value = value.trim()
        }

        isValid = value !== ''
      }
    }

    if (rules.matches) {
      isValid = rules.matches.value === value && isValid
    }    

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength  && isValid
    }

    if (rules.minVal) {
      isValid = value >= rules.minVal && isValid
    }

    if (rules.maxVal) {
      isValid = value <= rules.maxVal && isValid
    }

    if (rules.isEmail) {
      const pattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      isValid = pattern.test(value) && isValid
    }

    if (rules.isNumeric) {
      const pattern = /^\d+$/
      isValid = pattern.test(value) && isValid
    }

    if (rules.isPhone) {
      //Validating multiple phone number formats

      //Basic 10 digit - Very Lax (not recommended for actual  use)
      // const numeric10 = /^\d{10}$/

      //North American format with area code
      const formatNA = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/

      //International with country code
      const formatInter_w_CC = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/

      isValid = (
        // numeric10.test(value) 
        // || 
        formatNA.test(value) 
        || 
        formatInter_w_CC.test(value)
      ) && isValid
    }

    if (rules.isZip) {
      const pattern = /(^\d{5}$)|(^\d{5}-\d{4}$)/
      isValid = pattern.test(value) && isValid
    }

    /* 
      RegEx patterns credits to:
      https://stackoverflow.com/users/3070595/srinivas
      https://stackoverflow.com/users/63550/peter-mortensen
    */ 
    if (rules.regex !== undefined) {
      let pattern = null
      switch (rules.regex) {
        case ('type1'):
          // Minimum eight characters, at least one letter and one number
          pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
          break
        case ('type2'): 
          // Minimum eight characters, at least one letter, one number and one special character
          pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
          break
        case ('type3'):
          // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
          pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
          break
        case ('type4'):
          // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
          pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/
          break
        case ('type5'):
          // Minimum eight and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character
          pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,10}/
          break
        default:
          pattern = //
          isValid = true
      }

      isValid = pattern.test(value) && isValid

    }
  } else {
    // Field is empty (user did not answer), but is not required so it is still valid
    isValid = (!rules.required) ? true : false;
  }
  // console.log(`Validity: ${isValid}`)
  return isValid
}