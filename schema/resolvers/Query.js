const User = require('../../models/User');

module.exports = {
    user: async (parent, args) => {
        
        const user = await User.findById(args.id);
        return user;
        
    },
    users: async () => await User.find({}),
}