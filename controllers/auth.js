const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usersdb'
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body)
        if (!email || !password) {
            return res.status(400).json({ message: "Please Provide an email and password" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (!results || results.length === 0) {
                return res.status(401).json({ message: "Email or Password is incorrect" });
            }
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                return res.status(401).json({ message: "Email or Password is incorrect" });
            } else {
                const id = results[0].id;

                const token = jwt.sign({ id }, "h76FjKlpqRi9zA1YsE4nBwTgVc5xN3mD", {
                    expiresIn: '1m'
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                res.status(200).json({ message: "login" });
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.registration = (req, res) => {
    console.log(req.body);
    const { name,surname, email, password } = req.body;
    if (!name || !surname || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    db.query('SELECT email from users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.status(400).json({ message: "The email is already in use" });
            }
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        db.query('INSERT INTO users SET ?', { name: name,surname:surname, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.status(200).json({ message: "User registered" });
            }
        })
    })
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                "h76FjKlpqRi9zA1YsE4nBwTgVc5xN3mD"
            );
            console.log(decoded);
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (err, results) => {
                console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}
exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 60 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}

function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}