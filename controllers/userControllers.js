import User from '../models/User.js';



export const getUsers = async (req, res) => { //endpoint to get all matched or not users &/ filtered by skills or category or keyword.
  
  
  const {  field, category, keyword } = req.query; // categories are Tech, Languages , field is either skills or needs and keyword is the search term.


  const {skills, needs, excludeUserId} = req.body; // when a user is logged in and has skills and needs

  console.log("req.query", req.query);
  console.log("req.body", req.body);
  
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
    if (skills && !needs) {
      try {
        const users = await User.find({ needs: { $in: skills }, _id: { $ne: excludeUserId } }).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else if (needs && !skills) {
      try {
        const users = await User.find({ skills: { $in: needs }, _id: { $ne: excludeUserId } }).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else if (skills && needs) {
      try {
        const users = await User.find({ skills: { $in: needs }, needs: { $in: skills }, _id: { $ne: excludeUserId } }).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  }else { // If the user chooses to search for users by category, field or keyword:
  

  if (category || field || keyword) { // We check if there is a category, field or keyword

    
    if (keyword && !category) { // Cases when there is a keyword
      
      if (field) { //The case if there is a keyword+field:

         // If the field is skills, we will find users who have those skills
        console.log("Iam here after if (field) { //The case if there is a keyword+field:"); 

        try {
          
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
              $match:  { // We are using the match operator to match the populated field with the keyword
                $or: [
                  { firstName: { $regex: keyword, $options: 'i' } },
                  { lastName: { $regex: keyword, $options: 'i' } },
                  { email: { $regex: keyword, $options: 'i' } },
                  { location: { $regex: keyword, $options: 'i' } },
                  { 'populatedfield.name': { $regex: keyword, $options: 'i' } },
                ]
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
            $match: {
              $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { 'populatedSkills.name': { $regex: keyword, $options: 'i' } }, 
                { 'populatedNeeds.name': { $regex: keyword, $options: 'i' } },
              ]
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

        // const fieldMatchPipeline = [
        //   ...categoryMatchPipeline, // We are using the spread operator to add the categoryMatchPipeline to the fieldMatchPipeline.
        //   {
        //     $lookup: {
        //       from: field,
        //       localField: 'skills',
        //       foreignField: '_id',
        //       as: 'populatedField',
        //     },
        //   },
        //   {
        //     $match: {
        //       'populatedField.category': category,
        //     },
        //   },
        // ];

        // users = await User.aggregate(fieldMatchPipeline);
        
        console.log("Iam here The case if there is a category+field:");
        try {
          
          const pipeline = [
            {
              $lookup: {
                from: 'skills', // Here we join the users collection with the skills collection
                localField: field, // The field in the users collection
                foreignField: '_id', // The field in the skills collection
                as: 'populatedfield', 
              }
            },
            {$lookup: {
                    from: 'categories', // Here we join the populated field with the categories collection
                    localField: 'populatedfield.category', // The field in the populated field
                    foreignField: '_id', // The field in the categories collection
                    as: 'populatedfieldCategory',
                  }},
            {
              $match: {
                'populatedfieldCategory': { $elemMatch: { 'name': category } }
              }
            }
                  
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
            localField: 'populatedfield.category',
            foreignField: '_id',
            as: 'populatedfieldCategory',
          }},
          {
            $match: {
              $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { 'populatedSkills.name': { $regex: keyword, $options: 'i' } }, 
                { 'populatedNeeds.name': { $regex: keyword, $options: 'i' } },
              ]
            }
          }
        ];

        const users = await User.aggregate(pipeline);
        checkUser(users, res);

      } else if (keyword && field) { // The case if there is a category+field+keyword:

        console.log("Iam here The case if there is a category+field+keyword");
        const pipeline = [
          {
            $lookup: {
              from: 'skills', 
              localField: field, // The field in users collection
              foreignField: '_id', // The field in skills collection
              as: 'populatedfield', // Alias for populated field
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
            $match: {
              $or: [
                { firstName: { $regex: keyword, $options: 'i' } },
                { lastName: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { location: { $regex: keyword, $options: 'i' } },
                { 'populatedfield.name': { $regex: keyword, $options: 'i' } },
                { 'populatedfieldCategory.name': category },
              ]
            }
          }
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
              $or: [
                { 'populatedSkillsCategory.name': category },
                { 'populatedNeedsCategory.name': category },
              ]
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
      const users = await User.find().populate("skills needs");
      checkUser(users ,res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }}
};

export const getUser = async (req, res) => { //endpoint to get a single user
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("skills");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createUser = async (req, res) => {
  const {firstName, lastName, email, password} = req.body;
  try {
    const user = await User.create({firstName, lastName, email, password});
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to create a user

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {firstName, lastName, email, location, skills, needs, visibility} = req.body;

  try {
    const user = await User.findByIdAndUpdate({_id: id}, {firstName, lastName, email, location, skills, needs, visibility}, {new: true}).populate('skills needs');

    console.log("updated user", user)
    res.status(200).json(user);
  } catch (error) {
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
    
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}//endpoint to login a user


