const User = require('../../models/User');
const Book = require('../../models/Book');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

const registerSchema = Joi.object({
    username: Joi.string()
                .alphanum()
                .min(4)
                .max(20)
                .required(),
    email: Joi.string()
                .email({ minDomainSegments: 2 })
                .required(),
    password: Joi.string()
                .min(8).max(30)
                .required(),
    password2: Joi.any()
                .valid(Joi.ref('password'))
                .required()

});

const editSchema = Joi.object({
    username: Joi.string()
                .alphanum()
                .min(4)
                .max(20),
    email: Joi.string()
                .email({ minDomainSegments: 2 }),
    password: Joi.string().min(8).max(30)
});

const hashPass = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt)
    return hashedPass;
}

module.exports = {
    register: async (parent, args) => {
        const { username, email, password, password2 } = args;

        // validate the data using Joi
        const { error } = registerSchema.validate({ username, email, password, password2 });

        if (error) throw error;

        // Check if username or email are already used
        let sameUsernameOrEmail;
        try {
            sameUsernameOrEmail = await User.findOne({ $or: [{username}, {email}] });
        } catch(e) {
            throw new Error("An error has accured");
        }

        if (sameUsernameOrEmail) {
            
            if (sameUsernameOrEmail.username === username)
                throw new Error("Username already registered")
            else if (sameUsernameOrEmail.email === email)
            throw new Error("Email already registered")

        }

        // if it passes all the tests:

        const hashedPass = await hashPass(password);

        let user;
        try {
            user = new User({ username, email, password: hashedPass });
        } catch(e) {
            throw new Error("An error has accured");
        }

        await user.save();


        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: user.id };
    },
    editUser: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");

        const { username, email, newPassword, newPassword2, password } = args;

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("User not found");
        }

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch)
            throw new Error("Incorrect password");

        const { error } = editSchema.validate({ username, email, password: newPassword});
        if (error) throw error;

        if (newPassword !== newPassword2)
            throw new Error("Passwords does not match")

        let userData = { username, email, password: newPassword };

        for (item in userData) 
            if (!userData[item]) delete userData[item];

        if (userData['password']) {
            const salt = await bcrypt.genSalt();
            userData['password'] = await bcrypt.hash(userData['password'], salt);
        }

        try {
            await user.updateOne(userData);
        } catch (e) {
            throw new Error("An error has accured");
        }

        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: user.id }

    },
    deleteUser: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("User not found");
        }

        const passMatch = await bcrypt.compare(args.password, user.password);

        if (!passMatch)
            throw new Error("Incorrect password");

        await user.deleteOne();

        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: userId }

    },
    addBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        const {name, author, year, cover} = args;

        let book;
        try {
            book = new Book({
                name, author, year, cover, ownerId: userId
            });
        } catch(e) {
            throw new Error("An error has accured");
        }

        await book.save();

        return book;

    },
    editBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");

        let bookData = {...args};
        delete bookData['id'];

        let book;
        try {
            book = await Book.findOneAndUpdate({ $and: [{ _id: args.id }, { ownerId: userId }] }, bookData);
        } catch(e) {
            throw new Error("Book not found")
        }
        

        return book;
    },
    deleteBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("Unauthorized");
        
        let book;
        try {
            book = await Book.findOneAndDelete({ $and: [{ ownerId: userId }, { _id: args.id }] });
        } catch (e) {
            throw new Error("Book not found");
        }
        return book;
    }
}