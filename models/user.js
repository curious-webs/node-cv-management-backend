const mongoose = require ('mongoose');
const {jwtr} = require ('../common/common');
const csc = require ('country-state-city').default;
const {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} = require ('postcode-validator');
const PhoneNumber = require ('awesome-phonenumber');

// schema property values
let genderVal = ['male', 'female', 'others', 'prefer_not_to_say'];
let user_roles = ['admin', 'user', 'others'];

// const jwt = require("jsonwebtoken");
const Joi = require ('joi');

const userSchema = new mongoose.Schema ({
  userName: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 15,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: user_roles,
    default: 'user',
  },
  firstName: {
    type: String,
    max: 20,
    min: 2,
  },
  middleName: {
    type: String,
    max: 20,
    min: 2,
  },
  lastName: {
    type: String,
    max: 20,
    min: 2,
  },
  gender: {
    type: String,
    enum: genderVal,
  },
  dateOfBirth: {
    type: Date,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    address_name: {
      type: String,
    },
    address_line_1: {
      type: String,
    },
    address_line_2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    landmark: {
      type: String,
    },
    country_code: {
      type: String,
    },
    zip_code: {
      type: String,
    },
    phone: {
      primary: {
        type: String,
        max: 15,
        default: '',
      },
      alternate: {
        type: String,
        max: 15,
        default: '',
      },
    },
  },
  profileImg: {
    type: String,
  },
  cv: [
    {
      jobName: {
        type: String,
      },
      coverLetterText: {
        type: String,
      },
      cvFile: {
        type: String,
      },
    },
  ],
});

// Token Generation
userSchema.methods.generateAuthToken = function () {
  const token = jwtr.sign (
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      isVerified: this.isVerified,
      role: this.role,
    },
    'MyPrivateKey'
  );

  return token;
};

// Model Configuration
const User = mongoose.model ('Users', userSchema);

// Validation detail
// make changes in this function if Joi version < 16
function validateUserInputs (user) {
  const schema = Joi.object ({
    userName: Joi.string ()
      .min (4)
      .max (15)
      .regex (/^[_ a-zA-Z0-9]+$/)
      .required ()
      .messages ({
        'string.pattern.base': 'Username contain only alphanumeric and _',
      }),
    email: Joi.string ().email ().required (),
    password: Joi.string ()
      .min (6)
      .regex (/^(?=.*[!@#\$%\^&\*])(?=.{6,})/)
      .required ()
      .messages ({
        'string.pattern.base': 'must have length 6 and one special character',
      }),
  });

  return schema.validate (user, {abortEarly: false});
}

function validateUserProfile (user) {
  console.log ('here goes user');
  console.log (user);
  const schema = Joi.object ({
    // firstName: Joi.string ().max (20).min (2),
    // middleName: Joi.string ().max (20).min (2),
    // lastName: Joi.string ().max (20).min (2),
    gender: Joi.string ().valid (...genderVal).messages ({
      'string.pattern.base': 'gender is not valid',
    }),
    dateOfBirth: Joi.date ().iso (),
    phone: Joi.string (),
    role: Joi.string ().valid (...user_roles),
  }).unknown ();

  return schema.validate (user, {abortEarly: false});
}

function validateEmail (user) {
  let schema = Joi.object ({
    userName: Joi.string ().email (),
  });

  return schema.validate (user, {abortEarly: false});
}

function validateAddress (address) {
  const addrErr = {};

  if (address.address_line_1) {
    const regex = RegExp (/^[a-z\d\-.#_\s]+$/i);

    if (!regex.test (address.address_line_1))
      return {
        addrErr: {
          error: 'only allowed alphnumeric and . or # or -',
          isValid: false,
        },
      };
  }

  if (address.landmark) {
    const regex = RegExp (/^[a-z\d\-.#_\s]+$/i);
    if (!regex.test (address.landmark))
      return {
        addrErr: {
          error: 'only allowed alphnumeric and . or # or -',
          isValid: false,
        },
      };
  }

  //   const country = csc.getCountryByCode (address.country_code);
  //   if (!country)
  //     return {
  //       addrErr: {
  //         error: 'Country code is not valid',
  //         isValid: false,
  //       },
  //     };

  //   const state = csc.getStatesOfCountry (country.id).filter (item => {
  //     return address.state == item.name;
  //   });
  //   if (state.length == 0)
  //     return {
  //       addrErr: {
  //         error: 'state is not valid',
  //         isValid: false,
  //       },
  //     };
  // console.log("here goes cities");
  // console.log(csc.getCitiesOfState(...state.map (item => item.id)));
  //   const city = csc
  //     .getCitiesOfState (...state.map (item => item.id))
  //     .filter (item => {
  //       return address.city == item.name;
  //     });
  //   if (city.length == 0)
  //     return {
  //       addrErr: {
  //         error: 'city is not valid',
  //         isValid: false,
  //       },
  //     };
  // if (
  //   !postcodeValidatorExistsForCountry (address.country_code) ||
  //   !postcodeValidator (address.zip_code, address.country_code)
  // )
  //   return {
  //     addrErr: {
  //       error: 'zip code is not valid',
  //       isValid: false,
  //     },
  //   };

  // if (
  //   address.address_type &&
  //   addressTypeVal.filter (item => {
  //     return address.address_type == item;
  //   }).length == 0
  // )
  //   return {
  //     addrErr: {
  //       error: 'address type is not valid',
  //       isValid: false,
  //     },
  //   };

  // if (
  //   address.address_tag &&
  //   addressTags.filter (item => {
  //     return address.address_tag == item;
  //   }).length == 0
  // )
  //   return {
  //     addrErr: {
  //       error: 'address tag is not valid',
  //       isValid: false,
  //     },
  //   };

  // if (address.phone) {
  //   if (address.phone.primary) {
  //     let primary = new PhoneNumber (address.phone.primary, address.country);
  //     if (!primary.isValid ())
  //       return {
  //         addrErr: {
  //           error: 'phone is not valid',
  //           isValid: false,
  //         },
  //       };
  //   }
  //   if (address.phone.alternate) {
  //     let alternate = new PhoneNumber (
  //       address.phone.alternate,
  //       address.country
  //     );
  //     if (!alternate.isValid ())
  //       return {
  //         addrErr: {
  //           error: 'alternate phone is not valid',
  //           isValid: false,
  //         },
  //       };
  //   }
  // }

  return addrErr;
}

module.exports.User = User;
module.exports.validate = validateUserInputs;
module.exports.validateProfile = validateUserProfile;
module.exports.validateAddress = validateAddress;
module.exports.validateEmail = validateEmail;
