import User from '../models/User.js';
import cloudinary from '../db/configCloudinary.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const secretToken = process.env.SECRET_TOKEN;

const generateToken = (data) => {
  return jwt.sign(data, secretToken, {expiresIn: '5h'})
}



export const getUsers = async (req, res) => { //endpoint to get all matched or not users &/ filtered by skills or category or keyword.
  const excludeUserId = req.user.id;
  
  const {  field, category, keyword, skills, needs} = req.query; // categories are Tech, Languages , field is either skills or needs and keyword is the search term.

  console.log("req.query", req.query);


  
  if (field !== undefined && category === undefined && keyword === undefined && Object.keys(req.query).length === 1 && Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'If field parameter is provided, please include additional filters like category, keyword, or body' });
  }
  

  const checkUser = (user, res) => { // function to check if a user exists and return the user or a message
    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'No user found matching the criteria' });
    } else {
      return res.json(user);
    }
  };
  if (skills || needs) {
    try {
      let query = { _id: { $ne: excludeUserId } };
  
      if (skills && !needs) {
        query.$or = [{ needs: { $in: skills } }];
      } else if (needs && !skills) {
        query.$or = [{ skills: { $in: needs } }];
      } else if (skills && needs) {
        query.$or = [
          { needs: { $in: skills } },
          { skills: { $in: needs } },
        ];
      }
  
      const users = await User.find(query).populate("skills needs");
      checkUser(users, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }else { 
    // If the user chooses to search for users by category, field or keyword:

  if (!category && !keyword && !req.body) {
    return res.status(400).json({ message: 'Please provide a filter' });
  }


  if (category || field || keyword) {


    
    if (keyword && !category) { // Cases when there is a keyword
      
      if (field) { //The case if there is a keyword+field:

         // If the field is skills, we will find users who have those skills
        console.log("Iam here after if (field) { //The case if there is a keyword+field:"); 

        try {
          let otherField = '';
          if (field === 'skills') {
            otherField = 'needs';
          }else if (field === 'needs') {
            otherField = 'skills';
          }
          
          const pipeline = [
            {
              $lookup: { // We are using the lookup operator to join the users collection with the skills collection
                from: 'skills', // The collection to join with ex. skills
                localField: field, // The field in the users collection
                foreignField: '_id', // The field in the skills collection
                as: 'populatedfield', // The alias for the populated field
              }
            },
            {
              $lookup : {
                from: 'skills',
                localField: otherField,
                foreignField: '_id',
                as: 'populatedfield2',
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'populatedfield.category',
                foreignField: '_id',
                as: 'populatedfieldCategory',
              
              }
            },
            {
              $match:  { // We are using the match operator to match the populated field with the keyword
                _id: { $ne: excludeUserId },
                visibility:true,
                $or: [
                  { firstName: { $regex: keyword, $options: 'i' } },
                  { lastName: { $regex: keyword, $options: 'i' } },
                  { email: { $regex: keyword, $options: 'i' } },
                  { location: { $regex: keyword, $options: 'i' } },
                  { 'populatedfield.name': { $regex: keyword, $options: 'i' } },
                  { 'populatedfieldCategory.name': { $regex: keyword, $options: 'i' } },
                ]
              }
            },
            {
              $project: { // We are using the project operator to project the fields we want to display
                _id: 1,
                firstName: 1,
                lastName: 1,
                location: 1,
                img: 1,
                skills: {
                  $map: {
                    input: '$populatedfield',
                    as: `${field}`,
                    in: `$$${field}.name`
                  }
                },
                needs: {
                  $map: {
                    input: '$populatedfield2',
                    as: `${otherField}`,
                    in: `$$${otherField}.name`
                  }
                }
              }
            }

          ];

          const users = await User.aggregate(pipeline);

          checkUser(users, res);


        } catch (error) {
          res.status(500).json({ message: error.message });
        }

      }else {

        console.log("Iam here The case if there is only keyword") 
        //The case if there is only keyword:
      try {
        const pipeline = [
          {
            $lookup: {
              from: 'skills', 
              localField: 'skills', // The field in users collection
              foreignField: '_id', // The field in skills collection
              as: 'populatedSkills', // Alias for populated skills
            }
          },
          {
            $lookup: {
              from: 'skills', 
              localField: 'needs',
              foreignField: '_id',
              as: 'populatedNeeds',
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'populatedSkills.category',
              foreignField: '_id',
              as: 'populatedSkillsCategory',
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'populatedNeeds.category',
              foreignField: '_id',
              as: 'populatedNeedsCategory',
            }
          },
          {
            $match: {
              _id: { $ne: excludeUserId },
              visibility:true,
              $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { 'populatedSkills.name': { $regex: keyword, $options: 'i' } }, 
                { 'populatedNeeds.name': { $regex: keyword, $options: 'i' } },
                { 'populatedSkillsCategory.name': { $regex: keyword, $options: 'i' } },
                { 'populatedNeedsCategory.name': { $regex: keyword, $options: 'i' } },
              ]
            }
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              location: 1,
              img: 1,
              skills: {
                $map: {
                  input: '$populatedSkills',
                  as: 'skill',
                  in: '$$skill.name'
                }
              },
              needs: {
                $map: {
                  input: '$populatedNeeds',
                  as: 'need',
                  in: '$$need.name'
                }
              }
            }
          }
        ];
    
        const users = await User.aggregate(pipeline);
  
        checkUser(users, res);
  
        }catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    } else if (category) { 
      if (field && !keyword) { // The case if there is a category+field:

        
        console.log("Iam here The case if there is a category+field:");
        try {

          let otherField = '';
          if (field === 'skills') {

          otherField = 'needs'; 
          }else if (field === 'needs') {
            otherField = 'skills';
          }
          const pipeline = [
            {
              $lookup: {
                from: 'skills',
                localField: field,
                foreignField: '_id',
                as: 'populatedfield1'
              }
            },
            {
              $lookup: {
                from: 'skills',
                localField: otherField,
                foreignField: '_id',
                as: 'populatedfield2'
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'populatedfield1.category',
                foreignField: '_id',
                as: 'populatedfieldCategory',
              }
            },
            {
              $match: {
                _id: { $ne: excludeUserId },
                'populatedfieldCategory': { $elemMatch: { 'name': category } },
                visibility:true


              }
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                location: 1,
                img: 1,
                [field]: {
                  $map: {
                    input: `$populatedfield1`,
                    as: `${field}`,
                    in: `$$${field}.name`,
                  },
                },
                [otherField]: {
                  $map: {
                    input: `$populatedfield2`,
                    as: `${otherField}`,
                    in: `$$${otherField}.name`,
                  },
                },
              },
            },
          ];

           const users = await User.aggregate(pipeline);
           checkUser(users, res);
         

        } catch (error) {
          res.status(500).json({ message: error.message });
        }


      } else if (keyword && !field) { // The case if there is a category+keyword:
        
        console.log("Iam here The case if there is a category+keyword:");
        const pipeline = [
          {
            $lookup: {
              from: 'skills',
              localField: 'skills',
              foreignField: '_id',
              as: 'populatedSkills',
            },
          },
          {
            $lookup: {
              from: 'skills',
              localField: 'needs',
              foreignField: '_id',
              as: 'populatedNeeds',
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'populatedfield.category',
              foreignField: '_id',
              as: 'populatedfieldCategory',
            },
          },
          {
            $match: {
              _id: { $ne: excludeUserId },
              visibility:true,
              $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { 'populatedSkills.name': { $regex: keyword, $options: 'i' } },
                { 'populatedNeeds.name': { $regex: keyword, $options: 'i' } },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              location: 1,
              img: 1,
              skills: {
                $map: {
                  input: '$populatedSkills',
                  as: 'skill',
                  in: '$$skill.name',
                },
              },
              needs: {
                $map: {
                  input: '$populatedNeeds',
                  as: 'need',
                  in: '$$need.name',
                },
              },
              img: 1,
            },
          },
        ];
        
        const users = await User.aggregate(pipeline);
        checkUser(users, res);        

      } else if (keyword && field) { // The case if there is a category+field+keyword:
        let otherField = '';
        if (field === 'skills') {
          otherField = 'needs';
        }else if (field === 'needs') {
          otherField = 'skills';
        }
        console.log("Iam here The case if there is a category+field+keyword", field, category, keyword);
        const pipeline = [
          {
            $lookup: {
              from: 'skills',
              localField: field,
              foreignField: '_id',
              as: 'populatedField1',
            },
          },
          {
            $lookup: {
              from: 'skills',
              localField: otherField,
              foreignField: '_id',
              as: 'populatedField2',
            },
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'populatedField1.category',
              foreignField: '_id',
              as: 'populatedFieldCategory',
            },
          },
          {
            $match: {
              $and: [
                { 'populatedFieldCategory.name': category },
                {_id: { $ne: excludeUserId }},
                { visibility:true },
                {
                  $or: [
                    { firstName: { $regex: keyword, $options: 'i' } },
                    { lastName: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { location: { $regex: keyword, $options: 'i' } },
                    { 'populatedField1.name': { $regex: keyword, $options: 'i' } },
                    { 'populatedField2.name': { $regex: keyword, $options: 'i' } },
                  ],
                },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              location: 1,
              img: 1,
              [field]: {
                $map: {
                  input: `$populatedField1`,
                  as: `${field}`,
                  in: `$$${field}.name`,
                },
              },
              [otherField]: {
                $map: {
                  input: `$populatedField2`,
                  as: `${otherField}`,
                  in: `$$${otherField}.name`,
                },
              },
            },
          },
        ];
        
        const users = await User.aggregate(pipeline);
        checkUser(users, res);
        
      }else {
        // if its just a category
        const pipeline = [
          {
            $lookup: {
              from: 'skills', 
              localField: 'skills', // The field in users collection
              foreignField: '_id', // The field in skills collection
              as: 'populatedSkills', // Alias for populated skills
            }
          },
          {
            $lookup: {
              from: 'skills', 
              localField: 'needs',
              foreignField: '_id',
              as: 'populatedNeeds',
            }
          },
          {$lookup: {
            from: 'categories',
            localField: 'populatedSkills.category',
            foreignField: '_id',
            as: 'populatedSkillsCategory',
          }},
          {$lookup: {
            from: 'categories',
            localField: 'populatedNeeds.category',
            foreignField: '_id',
            as: 'populatedNeedsCategory',
          }},
          {
            $match: {
              _id: { $ne: excludeUserId },
              visibility:true,
              $or: [
                { 'populatedSkillsCategory.name': category },
                { 'populatedNeedsCategory.name': category },
              ]
            }
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              location: 1,
              img: 1,
              skills: {
                $map: {
                  input: '$populatedSkills',
                  as: 'skill',
                  in: '$$skill.name'
                }
              },
              needs: {
                $map: {
                  input: '$populatedNeeds',
                  as: 'need',
                  in: '$$need.name'
                }
              }
            
            }
          }
        ];
        const users = await User.aggregate(pipeline);
        checkUser(users, res);
      }
  }
  }else {
    // The case if there is no category, field or keyword and we just want to get all users:
      try {
        const users = await User.find({ _id: { $ne: excludeUserId }, visibility: true}).populate("skills needs"); // find excluding the current user
      checkUser(users ,res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }}
};

export const getUser = async (req, res) => { //endpoint to get a single user
  const { id } = req.user;
  try {
    const user = await User.findById(id).populate("skills needs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
    res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getUserById = async (req, res) => { //endpoint to get a single user by id
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("skills needs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } else {
    res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createUser = async (req, res) => {
  const {firstName, lastName, email, password} = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({firstName, lastName, email, password: hashedPassword});
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to create a user

export const updateUser = async (req, res) => {
  const { id } = req.user;
  const {firstName, lastName, email, location, description, visibility, img} = req.body;
  const skills = JSON.parse(req.body.skills);
  const needs = JSON.parse(req.body.needs);
  let imageUrl = '';


  try {
    let imageUrl = '';

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
              //Specify the folder in Cloudinary to store the image. In my case, I call it films since all images stored are gonna be related to this topic
              folder: 'users',
          }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
          });
          // The file's data is sent to Cloudinary. req.file.buffer will contain the file's data as a binary buffer, which is what you're uploading. 
          //The .end() method on the upload stream is used to write this buffer to the stream, initiating the upload process.
          uploadStream.end(req.file.buffer);
      });
      // Once the promise resolves, the result object contains details about the uploaded file, including its URL on Cloudinary's servers. After the upload is successful, we store the image URL returned by Cloudinary
      imageUrl = result.url; 
  }

    const user = await User.findByIdAndUpdate({_id: id}, {firstName, lastName, email, location, skills, needs, visibility, description, img: req.file ? imageUrl : img}, {new: true}).populate('skills needs');

    res.status(200).json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }

}//endpoint to update a user


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id, email: user.email });

    res.status(200).json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to login a user


