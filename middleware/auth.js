const {jwtr} = require ('../common/common');
const logger = require ('../libs/loggerLib');
const response = require ('../libs/responseLib');
module.exports = async function (req, res, next) {
  let token = '';
  let apiResponse = '';
  if (req.header ('x-auth-token')) {
    token = req.header ('x-auth-token');
  } else {
    token = req.params.token;
  }
  // console.log("here goes token");
  
  // console.log(token);  

  if (!token)
    return res.status (401).send ('Access denied. No token provided.');

  try {
    const decoded = await jwtr.verify (token, 'MyPrivateKey');
    req.user = decoded;
    next ();
  } catch (ex) {
    console.log (ex);

    if (ex.name == 'TokenDestroyedError') {
      apiResponse = response.generate (
        true,
        'Already verified',
        400,
        {isVerified: true,isTokenDestroyed:true},
        {}
      );
      res.status (400).send (apiResponse);
    }
    apiResponse = response.generate (
      true,
      'Invalid token',
      400,
      {isVerified: false},
      {}
    );
    res.status (400).send (apiResponse);
  }
};
