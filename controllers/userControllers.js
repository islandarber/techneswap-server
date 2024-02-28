import User from '../models/User.js';
import Skill from '../models/Skill.js';



export const getUsers = async (req, res) => { //endpoint to get all users &/ filtered by skills or category or keyword.
  const {  field, category, keyword } = req.query; // categories are Tech, Languages , field is either skills or needs and keyword is the search term.
  const {skills, needs} = req.body;

  

  const checkUser = (user,res) => {
    if (user.length === 0) {
      return res.status(404).json({ message: 'No user found matching the criteria' });
    } else {
      return res.json(user);
    }
  };

  if (skills || needs) {

    if (skills) {
      console.log("Iam where you put me");
      try {
        const users = await User.find({needs: { $in: skills }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else if (needs){
      try {
        const users = await User.find({skills: { $in: needs }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }else if (skills && needs) {
      try {
        const users = await User.find({skills: { $in: needs }, needs: { $in: skills }}).populate("skills needs");
        checkUser(users, res);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }

  } else if (req.body.length === 0) {
  


  if (!category && !keyword && !req.body) {
    return res.status(400).json({ message: 'Please provide a filter' });
  }


  if (category || field || keyword) {

    
    if (keyword) {
      
      if (field) {
        //The case if there is a field and a keyword:

        try {
          
          const pipeline = [
            {
              $lookup: {
                from: field, 
                localField: 'skills', 
                foreignField: '_id', 
                as: 'populatedfield', 
              }
            },
            {
              $match:  {
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
        //The case if there is only a keyword:
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
  
        if (users.length === 0) {
          return res.status(404).json({ message: 'No user found matching the criteria' });
        } else {
          return res.json(users);
        }
  
        }catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
    } else if (category) {
      const categoryMatchPipeline = [
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
            localField: 'populatedSkills.category',
            foreignField: '_id',
            as: 'populatedSkillsCategory',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'populatedNeeds.category',
            foreignField: '_id',
            as: 'populatedNeedsCategory',
          },
        },
        {
          $match: {
            $or: [
              { 'populatedSkillsCategory.name': category },
              { 'populatedNeedsCategory.name': category },
            ],
          },
        },
      ];

      let users;

      if (field) {
        const fieldMatchPipeline = [
          ...categoryMatchPipeline,
          {
            $lookup: {
              from: field,
              localField: 'skills',
              foreignField: '_id',
              as: 'populatedField',
            },
          },
          {
            $match: {
              'populatedField.category': category,
            },
          },
        ];

        users = await User.aggregate(fieldMatchPipeline);
      } else if (keyword) {
        const keywordMatchPipeline = [
          ...categoryMatchPipeline,
          {
            $match: {
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
        ];

        users = await User.aggregate(keywordMatchPipeline);
      } else {
        users = await User.aggregate(categoryMatchPipeline);
      }

      checkUser(users, res);
  }else {
    // The case if there is no category, field or keyword and we just want to get all users:
      try {
      const users = await User.find().populate("skills needs");
      checkUser(users ,res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  }}
};

export const getUser = async (req, res) => { //endpoint to get a single user
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("skill");
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


