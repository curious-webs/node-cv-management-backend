const {User} = require ('../models/user');
const auth = require ('../middleware/auth');
const logger = require ('../libs/loggerLib');
const response = require ('../libs/responseLib');
const express = require ('express');
const router = express.Router ();

router.get ('/', async (req, res) => {
  let cvs = await User.findById (req.query.id).select ('cv');
  return res.send (response.generate (false, 'success', 200, null, cvs));
});

router.put ('/add', auth, async (req, res) => {
  const addCV = await User.findByIdAndUpdate (
    req.user._id,
    {
      $push: {
        cv: {
          $each: [
            {
              jobName: req.body.jobName,
              coverLetterText: req.body.coverLetterText,
            },
          ],
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  let cvs = await User.findById (req.user._id);
  return res.send (response.generate (false, 'success', 200, null, cvs));
});

router.delete ('/', auth, async (req, res) => {
  console.log ('delete hit');
  let cvId = req.header ('cvId');
  // console.log (cvId);


  let cvs = await User.updateOne (
    {'cv._id': cvId},
    {$pull: {cv: {_id: cvId}}},
    {multi: true}
  );
  // console.log ('here goes cv');
  // console.log (cvs);
  return res.send (response.generate (false, 'success', 200, null, cvs));
});

module.exports = router;
