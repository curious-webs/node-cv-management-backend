const {
  User,
  validate,
  validateEmail,
  validateProfile,
  validateAddress,
} = require ('../models/user');
const {sendEmail} = require ('../routes/email');
const {verify_html} = require ('../email-templates/verify');
const {jwtr} = require ('../common/common');
const auth = require ('../middleware/auth');
const logger = require ('../libs/loggerLib');
const response = require ('../libs/responseLib');
const isUserVerified = require ('../middleware/isVerified');
const _ = require ('lodash');
const bcrypt = require ('bcrypt');
const express = require ('express');
const path = require ('path');
const fs = require ('fs-extra');
const {dirname} = require ('path');
const isVerified = require ('../middleware/isVerified');
const router = express.Router ();

router.get ('/', async (req, res) => {
  let users = {};
  let totalUsers = await User.count ();
  let startIndex = parseInt (req.query.startIndex);
  let endIndex = parseInt (req.query.endIndex);

  if (req.query.startIndex && isNaN (startIndex)) {
    logger.error ('startIndex must be number', 'Route : /', 10);
    errorDetail = {
      startIndex: ' must be number',
    };
    apiResponse = response.generate (
      true,
      'startIndex must be number',
      400,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (req.query.endIndex && isNaN (endIndex)) {
    logger.error ('endIndex must be number', 'Route : /', 10);
    errorDetail = {
      endIndex: ' must be number',
    };
    apiResponse = response.generate (
      true,
      'endIndex must be number',
      400,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (endIndex < startIndex) {
    logger.error ('endIndex must be greater than startIndex', 'Route : /', 10);
    apiResponse = response.generate (
      true,
      'endIndex must be greater than startIndex',
      400,
      null,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (req.query.endIndex > totalUsers || endIndex < 1) {
    logger.error (
      'endIndex must be less than the total Users and greater than or equal to 1',
      'Route : /',
      10
    );
    apiResponse = response.generate (
      true,
      'endIndex must be less than the total Users and greater than or equal to 1',
      400,
      null,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (startIndex < 1 || startIndex > totalUsers) {
    logger.error (
      'startIndex must be greater than or equal to 1 and less than or equal to  the tota users',
      'Route : /',
      10
    );
    apiResponse = response.generate (
      true,
      'startIndex must be greater than or equal to 1 and less than or equal to  the tota users',
      400,
      null,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (startIndex >= 1 && endIndex <= totalUsers) {
    users = await User.find ()
      .skip (startIndex)
      .limit (endIndex)
      .select ('-password');
  } else if (startIndex >= 1) {
    users = await User.find ().skip (startIndex).select ('-password');
  } else if (endIndex <= totalUsers) {
    users = await User.find ().limit (endIndex).select ('-password');
  } else {
    users = await User.find ().select ('-password');
  }

  apiResponse = response.generate (
    false,
    'startIndex must be greater than or equal to 1 and less than or equal to  the tota users',
    400,
    null,
    users
  );
  return res.send (apiResponse);
});

router.post ('/signup', async (req, res) => {
  console.log (req.body);
  let apiResponse = {};
  let errorDetail = {};
  const {error} = validate (
    _.pick (req.body, ['userName', 'email', 'password'])
  );
  if (error) return res.status (400).send (error.details);
  let user = await User.findOne ({
    userName: req.body.userName,
  });

  if (user) {
    logger.error ('User name already exist', 'Sign Up Route : /signup', 10);
    errorDetail = {
      userName: 'already exist',
    };
    apiResponse = response.generate (
      true,
      'User Name already exist',
      500,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  user = await User.findOne ({
    email: req.body.email,
  });

  if (user) {
    errorDetail = {
      email: 'already exist',
    };
    logger.error ('Email already exist', 'Sign Up Route : /signup', 10);
    apiResponse = response.generate (
      true,
      'Email already exist',
      500,
      errorDetail,
      req.body
    );
    return res.send (apiResponse);
  }

  req.body['role'] = 'user';
  user = new User (_.pick (req.body, ['userName', 'email', 'password']));

  const salt = await bcrypt.genSalt (10);
  user.password = await bcrypt.hash (user.password, salt);

  await user.save ();
  user['role'] = 'user';
  const token = await user.generateAuthToken ();

  let subject = 'Verification - SiLo App';
  let isMailSent = sendEmail (user, token, subject, 'verify_email');
  if (!isMailSent) {
    logger.error ('Mail sent failed', 'Sign Up Route : /signup', 10);
    apiResponse = response.generate (
      true,
      'something went wrong',
      500,
      null,
      null
    );
  }
  user.isVerified = false;

  apiResponse = response.generate (
    false,
    'User created successfully',
    200,
    null,
    _.pick (user, ['_id', 'userName', 'email', 'isVerified', 'role'])
  );
  return res.header ('x-auth-token', token).send (apiResponse);
});

router.get ('/verify', auth, async (req, res) => {
  const user = await User.findById (req.user._id).select ('-password');
  let apiResponse = response.generate (false, 'success', 200, user);
  return res.send (apiResponse);
});

router.put ('/verifyemail', auth, async (req, res) => {
  let apiresponse = {};

  const userDetail = await User.findById (req.user._id);

  if (userDetail && userDetail.isVerified) {
    apiResponse = response.generate (
      true,
      'email already verified',
      400,
      {
        isVerified: true,
      },
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  const isVerify = await User.findByIdAndUpdate (
    req.user._id,
    {
      isVerified: 'true',
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const user = await User.findById (req.user._id).select ('-password');
  const isTokenDestroy = await jwtr.destroy (String (req.user.jti));
  return res.send (user);
});

router.post ('/signin', async (req, res) => {
  console.log (req.body);
  let apiresponse = {};
  let errorDetail = {};
  let user = await User.findOne ({
    $or: [
      {
        userName: req.body.userName,
      },
      {
        email: req.body.userName,
      },
    ],
  });

  if (!user) {
    logger.error ('User not found', 'Sign in Route : /signin', 10);
    errorDetail = {
      userName: 'not found',
    };
    apiResponse = response.generate (
      true,
      'user not found',
      400,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  const verifyPassword = await bcrypt.compare (
    req.body.password,
    user.password
  );

  if (!verifyPassword) {
    logger.error ('password invalid', 'Sign in Route : /signin', 10);
    errorDetail = {
      password: 'invalid',
    };
    apiResponse = response.generate (
      true,
      'invalid password',
      500,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (!user.isVerified) {
    logger.error ('password invalid', 'Sign in Route : /signin', 10);
    errorDetail = {
      userName: 'Username not verified',
      isVerified: false,
    };
    apiResponse = response.generate (
      true,
      'user not verified',
      500,
      errorDetail,
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  const token = await user.generateAuthToken ();

  user = _.pick (user, ['_id', 'userName', 'email', 'isVerified']);

  apiResponse = response.generate (
    false,
    'login sucessfull',
    200,
    null,
    req.body
  );
  return res.header ('x-auth-token', token).send (apiResponse);
});

router.get ('/resendVerificationLink', async (req, res) => {
  let user = await User.findOne ({
    $or: [
      {
        userName: req.query.userName,
      },
      {
        email: req.query.userName,
      },
    ],
  });
  if (!user) {
    apiResponse = response.generate (
      true,
      'user not found',
      400,
      null,
      req.body
    );
    return res.status (400).send (apiResponse);
  }
  const token = await user.generateAuthToken ();
  let subject = 'Verification - SiLo App';
  let isMailSent = sendEmail (user, token, subject, 'verify_email');
  if (!isMailSent) {
    logger.error ('Mail sent failed', 'Sign Up Route : /signup', 10);
    apiResponse = response.generate (
      true,
      'something went wrong',
      500,
      null,
      null
    );
  }
  user.isVerified = false;
  apiResponse = response.generate (
    false,
    'email sent successfully',
    200,
    null,
    _.pick (user, ['_id', 'userName', 'email', 'isVerified'])
  );
  return res.header ('x-auth-token', token).send (apiResponse);
});

router.get ('/forgot-password', async (req, res) => {
  let apiResponse = {};
  let user = await User.findOne ({
    $or: [
      {
        userName: req.query.userName,
      },
      {
        email: req.query.userName,
      },
    ],
  }).select ('-password');
  if (!user) {
    logger.error (
      'User Not Found',
      'Forgot Password Route : /forgot-password',
      10
    );
    apiResponse = response.generate (
      true,
      'user not found',
      400,
      {
        errorDetail: {
          userName: 'not found',
        },
      },
      req.query.data
    );
    return res.status (400).send (apiResponse);
  }

  // const verifyPassword = await bcrypt.compare (
  //   req.body.password,
  //   user.password
  // );
  // if (!verifyPassword) return res.status (400).send ('invalid password');

  const token = await user.generateAuthToken ();
  let subject = 'Reset Password - SiLo App';
  let isMailSent = sendEmail (user, token, subject, 'reset_password');

  if (!isMailSent) {
    logger.error (
      'Mail sent failed',
      'forgot-password Route : /forgot-password',
      10
    );
    apiResponse = response.generate (
      true,
      'something went wrong',
      500,
      null,
      null
    );
  }
  apiResponse = response.generate (
    false,
    'email sent successfully',
    200,
    null,
    _.pick (user, ['_id', 'userName', 'email', 'isVerified'])
  );
  return res.header ('x-auth-token', token).send (apiResponse);
});

router.put ('/reset-password', auth, async (req, res) => {
  console.log ('reset password called');
  let apiResponse = {};

  if (req.user.isVerified == false) {
    const isVerify = await User.findByIdAndUpdate (
      req.user._id,
      {
        isVerified: 'true',
      },
      {
        new: true,
        runValidators: true,
      }
    );
    //return res.status (400).send ('user not verified');
  }

  if (req.body.password == undefined && req.body.confirmPassword == undefined) {
    apiResponse = response.generate (
      true,
      'required password and confirmPassword',
      500,
      {
        isVerified: true,
        isTokenDestroy: false,
      },
      req.body
    );
    return res.status (400).send (apiResponse);
  }

  if (req.body.password) {
    let user = await User.findById (req.user._id);

    const verifyPassword = await bcrypt.compare (
      req.body.password,
      user.password
    );
    console.log ('verify passwod');
    console.log (verifyPassword);
    // if (!verifyPassword) return res.status (400).send ('invalid password');

    if (verifyPassword) {
      logger.error (
        'Password can not be same as old password',
        'reset-password Route : /reset-password',
        10
      );
      apiResponse = response.generate (
        true,
        'password can not be same as old password',
        500,
        {
          password: 'can not be same as old password',
        },
        req.body
      );
      return res.status (400).send (apiResponse);
    }
  }

  console.log (req.body.confirmPassword);
  if (req.body.password !== req.body.confirmPassword) {
    logger.error (
      'password and confirm password should be same',
      'reset-password Route : /reset-password',
      10
    );
    apiResponse = response.generate (
      true,
      'password and confirm password should be same',
      500,
      {
        // password: 'should be same',
        confirmPassword: 'should be same',
      },
      req.body
    );

    return res.status (400).send (apiResponse);
  }

  const salt = await bcrypt.genSalt (10);
  req.body.password = await bcrypt.hash (req.body.password, salt);

  let isUpdated = await User.findByIdAndUpdate (
    {
      _id: req.user._id,
    },
    {
      password: req.body.password,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  isUpdated = _.pick (isUpdated, ['userName', '_id', 'email', 'isVerified']);
  isUpdated.passwordUpdated = 'true';

  apiResponse = response.generate (
    false,
    'password updated successfully',
    200,
    null,
    isUpdated
  );
  const isTokenDestroy = await jwtr.destroy (String (req.user.jti));
  console.log ('token destriy');
  console.log (isTokenDestroy);
  return res.send (apiResponse);
});
/**
 * @api {get} /logout Logout
 * @apiName Logout
 * @apiGroup User
 *
 * @apiHeader {String} x-auth-token User's unique x-auth-token.
 *
 * @apiSuccess {Boolean} logout   returns true or false
 * @apiSuccess {Boolean} istokenDestroy   returns true or false
 */
router.get ('/logout', auth, async (req, res) => {
  const isTokenDestroy = await jwtr.destroy (String (req.user.jti));
  apiResponse = response.generate (false, 'logout sucess', 200, null, null);
  return res.send (apiResponse);
});

/**
 * @api {put} /editProfile Edit User Profile
 * @apiName editprofile
 * @apiGroup User
 *
 * @apiDescription This is the Description.
 * It is multiline capable.
 *
 * Last line of Description.
 *
 * @apiHeader {String} x-auth-token User's unique x-auth-token.
 *
 * @apiParam {String} firstName string having maxlength 15 and minlength 4.
 * @apiParam {String} middleName string having maxlength 15 and minlength 4.
 * @apiParam {String} lastName string having maxlength 15 and minlength 4.
 * @apiParam {String} gender string having values in [male,female,others].
 * @apiParam {String} dateOfBirth string having ISO format.
 * @apiParam {Object} address object having address values
 * @apiParam {String} address_line_1 houe number/plot number, accepts string and ./#
 * @apiParam {String} landmark accepts valid string
 * @apiParam {String} country_code accepts valid country code like "IN"
 * @apiParam {String} zip_code object having valid zipcode
 * @apiParam {String} address_type string accepted  billing,shipping
 * @apiParam {String} address_tag string accepted  home,others,work
 * @apiParam {Object} having primary or alternate number
 *@apiParam {String} primary having valid number formatted string
 * @apiParam {String} alternate having valid number formatted string
 *
 * @apiSampleRequest http://localhost:3000/api/users/profile/edit
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *        "firstName": "jiru",
 *        "lastName": "X.",
 *        "middleName": "villima",
 *        "gender": "female",
 *        "dateOfBirth": "1999-09-21",
 *        "address": {
 *              "address_line_1": "h.no. 214",
 *              "city": "Abohar",
 *              "state": "Punjab",
 *              "landmark": "near papu ki dukan",
 *              "country_code": "IN",
 *              "zip_code": "140301",
 *              "address_type": "billing",
 *              "address_tag": "home",
 *              "phone": {
 *                   "primary": "+91 8725838433",
 *                   "alternate": "+91 7986474727"
 *              }
 *        }
 *   }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 *    {
 *        "address": {
 *        "phone": {
 *            "primary": "+91 8725838433",
 *            "alternate": "+91 7986474727"
 *         },
 *        "address_type": "billing",
 *        "address_tag": "home",
 *        "address_line_1": "h.no. 214",
 *        "city": "Abohar",
 *        "state": "Punjab",
 *        "landmark": "near papu ki dukan",
 *        "country_code": "IN",
 *        "zip_code": "140301"
 *     },
 *    "isVerified": true,
 *    "_id": "5f49ff9cbca6c623709fc816",
 *    "userName": "jirux",
 *    "email": "jirux@yopmail.com",
 *    "__v": 0,
 *    "gender": "female",
 *    "dateOfBirth": "1999-09-21T00:00:00.000Z",
 *    "firstName": "jiru",
 *    "lastName": "X.",
 *    "middleName": "villima",
 *    "profileImg": "D:\\MyMeanStackProjects\\silo-app\\public\\profileImages\\woocommerce-placeholder-150x150.png"
 *     }
 *
 *
 * @apiSuccess {Boolean} logout   returns true or false
 * @apiSuccess {Boolean} istokenDestroy   returns true or false
 */

router.put ('/profile/edit', auth, async (req, res) => {
  console.log (req.body);
  const userInfo = _.omit (req.body, ['address']);
  const {error} = validateProfile (userInfo);
  console.log("validating profile"); 
  if (error) return res.status (400).send (error.details);
  if (req.body.address) {
    let {addrErr} = validateAddress (req.body.address);
    if (addrErr) return res.status (400).send (addrErr);
  } 
  
  const user = await User.findByIdAndUpdate (req.user._id, {
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    phone:req.body.phone, 
    address: {
      address_name :  req.body.address.address_name,
      address_line_1: req.body.address.address_line_1,
      address_line_2: req.body.address.address_line_2,
      city: req.body.address.city,
      state: req.body.address.state,
      landmark: req.body.address.landmark,
      country_code: req.body.address.country_code,
      zip_code: req.body.address.zip_code,
      address_type: req.body.address.address_type,
      address_tag: req.body.address.address_tag,
      phone: {
        primary: req.body.address.phone.primary
      },
    },
  }, {
    new: true,
    runValidators: true,
  }).select ('-password');
  console.log("here updated user");
  console.log(user);
  apiResponse = response.generate (
    false,
    'adress added',
    200,
    null,
    user
  );
  // console.log("hey done");
  // console.log(apiResponse);
  return res.status(200).send (apiResponse);

});

router.get ('/profile', async (req, res) => {
  // console.log(req.query.id);
  const user = await User.findById (req.query.id).select ('-password');
  return res.send (user);
});

router.put ('/profile/image', auth, async (req, res) => {
  console.log("inside image block.. here comes files");
  console.log (req.files);

  if (
    !req.files ||
    Object.keys (req.files).length === 0 
  ) {
    return res.status (400).send ('No files were uploaded.');
  }
console.log(req.files.profileImg);
if(!req.files.profileImg){
  return res.status (200).send ('No files were uploaded. hmm');
}

  console.log (req.files.profileImg.mimetype);

  if (
    req.files.profileImg.mimetype !== 'image/jpeg' &&
    req.files.profileImg.mimetype !== 'image/png' &&
    req.files.profileImg.mimetype !== 'image/jpg'
  ) {
    return res
      .status (400)
      .send ('Image type not valid. accepted only jpg or png');
  }

  if (Math.floor (req.files.profileImg.size / 1000) > 5000) {
    return res.status (400).send ('Image size must be less than 5mb');
  }

  const userPicExist = await User.findById (req.user._id).select ({
    _id: 1,
    profileImg: 1,
  });

  if (userPicExist.profileImg) {
    const thePath = userPicExist.profileImg;
    if (
      fs.existsSync ('./public/profileImages/' + thePath.split ('\\').pop ())
    ) {
      const isDeleted = await fs.unlink (userPicExist.profileImg);
      console.log (isDeleted);
    }
  }

  let image = req.files.profileImg;

  try {
    await image.mv (
      path.join (__dirname, '../public/profileImages/') + image.name
    );
  //  let imgurl = path.join (__dirname, '../public/profileImages/') + image.name;
    let imgurl = 'http://localhost:3000/profileImages/' + image.name;
    const user = await User.findByIdAndUpdate (
      req.user._id,
      {
        profileImg: imgurl,
      },
      {
        new: true,
      }
    ).select ({
      _id: 1,
      profileImg: 1,
      email: 1,
      userName: 1,
    });
    return res.send (user);
  } catch (err) {
    return res.status (500).send (err);
  }
});

module.exports = router;
