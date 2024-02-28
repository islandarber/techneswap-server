import User from '../models/User.js';
import Skill from '../models/Skill.js';



export const getUsers = async (req, res) => { //endpoint to get all matched or not users &/ filtered by skills or category or keyword.
  
  
  const {  field, category, keyword } = req.query; // categories are Tech, Languages , field is either skills or needs and keyword is the search term.
  
  console.log("Iam here", req.query);

  const {skills, needs} = req.body; // when a user is logged in and has skills and needs
  
  
  if (!category && !keyword && !req.body) { // we need have at least one of these to filter the users
    return res.status(400).json({ message: 'Please provide a filter' });
  }

  const checkUser = (user, res) => { // function to check if a user exists and return the user or a message
    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'No user found matching the criteria' });
    } else {
      return res.json(user);
    }
  };
  

  if (skills || needs) { // First we check if the user has skills or needs which will be sent to the body

    if (skills) { // If the user only has skills, we will find users who need those skills
      console.log("Iam where you put me");
      try {
        const users = await User.find({needs: { $in: skills }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else if (needs){ // If the user only has needs, we will find users who have those skills
      try {
        const users = await User.find({skills: { $in: needs }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }else if (skills && needs) { // If the user has both skills and needs, we will find users who have those skills and need the skills of the user
      try {
        const users = await User.find({skills: { $in: needs }, needs: { $in: skills }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

  } else { // If the user chooses to search for users by category, field or keyword:
  

  if (category || field || keyword) { // We check if there is a category, field or keyword

    
    if (keyword) { // Cases when there is a keyword
      
      if (field) { //The case if there is a keyword+field:

         // If the field is skills, we will find users who have those skills
        

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
      if (field) { // The case if there is a category+field:

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


      } else if (keyword) { // The case if there is a category+keyword:

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

        const users = await User.aggregate(keywordMatchPipeline);
        checkUser(users, res);

      } else {
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


