module.exports = (users) => ({
    user: (parent, args) => {
        
        const user = users.find((u) => u.id == args.id);
        return user;
    },
    users: (parent, args) => users,
})