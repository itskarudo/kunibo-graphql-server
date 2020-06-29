const User = require('../../models/User');
const Book = require('../../models/Book');
const yup = require('yup');
const bcrypt = require('bcryptjs');

const registerSchema = yup.object({
    username: yup.string()
                    .required()
                    .min(4)
                    .max(20),
    email: yup.string()
                .email()
                .required(),
    password: yup.string()
                    .min(8)
                    .max(30)
                    .required(),
    password2: yup.string()
                    .oneOf([yup.ref('password'), null], 'Passwords does not match')
    
});

const editSchema = yup.object({
    username: yup.string()
                    .min(4)
                    .max(20),
    email: yup.string()
                .email(),
    password: yup.string()
                    .min(8)
                    .max(30)
});

const hashPass = async (password) => {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt)
    return hashedPass;
}

module.exports = {
    register: async (parent, args) => {
        const { username, email, password, password2 } = args;

        // validate the data using yup
        try {
            await registerSchema.validate({ username, email, password, password2 });
        } catch (err) {
            if (err) throw new Error(err.errors);
        }


        // Check if username or email are already used
        let sameUsernameOrEmail;
        try {
            sameUsernameOrEmail = await User.findOne({ $or: [{username}, {email}] });
        } catch(e) {
            throw new Error("INTERNAL_ERROR");
        }

        if (sameUsernameOrEmail) {
            
            if (sameUsernameOrEmail.username === username)
                throw new Error("USERNAME_EXISTS")
            else if (sameUsernameOrEmail.email === email)
            throw new Error("EMAIL_EXISTS")

        }

        // if it passes all the tests:

        const hashedPass = await hashPass(password);

        let user;
        try {
            user = new User({ username, email, password: hashedPass });
        } catch(e) {
            throw new Error("INTERNAL_ERROR");
        }

        await user.save();


        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: user.id };
    },
    editUser: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");

        const { username, email, newPassword, newPassword2, password } = args;

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("USER_NOT_FOUND");
        }

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch)
            throw new Error("PASSWORD_INCORRECT");

        try {
            await editSchema.validate({ username, email, password: newPassword});
        } catch (err) {
            throw new Error(err.errors);
        }

        if (newPassword !== newPassword2)
            throw new Error("PASSWORDS_NOT_MATCHED")

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
            throw new Error("INTERNAL_ERROR");
        }

        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: user.id }

    },
    deleteUser: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");

        let user;
        try {
            user = await User.findById(userId);
        } catch (e) {
            throw new Error("USER_NOT_FOUND");
        }

        const passMatch = await bcrypt.compare(args.password, user.password);

        if (!passMatch)
            throw new Error("INCORRECT_PASSWORD");

        await user.deleteOne();

        if (!user)
            return user
        else
            return { ...user._doc, password: null, _id: userId }

    },
    addBook: async (parent, args, req) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");
        
        const {name, author, year, cover} = args;

        let book;
        book = new Book({
            name, author, year, cover, ownerId: userId
        });
        
        try {
            await book.save();
        } catch(e) {
            throw new Error("INTERNAL_ERROR");
        }
        
        return book;

    },
    editBook: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");

        let bookData = {...args};
        delete bookData['id'];

        let book;
        try {
            book = await Book.findOneAndUpdate({ $and: [{ _id: args.id }, { ownerId: userId }] }, bookData);
        } catch(e) {
            throw new Error("BOOK_NOT_FOUND")
        }
        

        return book;
    },
    deleteBook: async (parent, args, {req}) => {
        const { isAuth, userId } = req;
        if (!isAuth || !userId)
            throw new Error("UNAUTHORIZED");
        
        let book;
        try {
            book = await Book.findOneAndDelete({ $and: [{ ownerId: userId }, { _id: args.id }] });
        } catch (e) {
            throw new Error("BOOK_NOT_FOUND");
        }
        return book;
    },
    revokeTokensForUser: async (parent, args) => {
        try {
            await User.findByIdAndUpdate(args.id, { $inc: { tokenVersion: 1 } });
            return true;
        } catch (e) {
            return false;
        }
    }
}