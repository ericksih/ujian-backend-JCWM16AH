const { db, dbQuery, createToken } = require("../config");

module.exports = {
  register: async (req, res, next) => {
    try {
      if (
        req.body.email.includes("@") &&
        req.body.username.length >= 6 &&
        req.body.password.length >= 6 &&
        req.body.password.match(/[0-9]/gi) &&
        req.body.password.match(/[a-z]/gi) &&
        req.body.password.match(/[!@#$%^&*()_+/-=~\\:';{}"\[\]|,.?<>\/]/gi)
      ) {
        const id0 = Date.now();
        const id1 = id0.toString();
        const userId = parseInt(id1.slice(0, 8));
        console.log(userId);
        const insertSQL = `Insert into users (uid, username, email, password) 
                values (${userId}, ${db.escape(req.body.username)}, ${db.escape(
          req.body.email
        )}, ${db.escape(req.body.password)});`;
        const regis = await dbQuery(insertSQL);
        const getUser = await dbQuery(
          `Select * from users where id = ${regis.insertId}`
        );
        const { id, uid, username, email, password, role, status } = getUser[0];

        //TOKEN
        const token = createToken({
          id,
          uid,
          username,
          email,
          password,
          role,
          status,
        });

        res.status(201).send({ id, uid, username, email, token });
      } else {
        res.status(500).send("Email, Username, Password tidak sesuai Validasi");
      }
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      console.log("Login Data :", req.body);
      const data = req.body;
      const queryWhere = [];
      for (property in data) {
        queryWhere.push(`${property} = ${db.escape(data[property])}`);
        // console.log(property, data[property]);
      }

      const queryLogin =
        `SELECT * FROM users WHERE ` + queryWhere.join(" AND ");
      const getUser = await dbQuery(queryLogin);
      // console.log("Role :", getUser[0].role);

      if (getUser[0].status != 1) {
        res.status(400).send("Your account is not active!");
      } else {
        if (getUser.length > 0) {
          const { id, uid, username, email, status, role } = getUser[0];
          const token = createToken({ id, uid, username, email, status, role });
          res
            .status(200)
            .send({ id, uid, username, email, status, role, token });
        } else {
          res.status(400).send("Account with that password not found!");
        }
      }
    } catch (error) {
      next(error);
    }
  },

  deactivate: async (req, res, next) => {
    try {
      const auth = req.user.id;
      console.log("Deactive user ID : ", auth);
      if (auth) {
        const queryDeactive = `UPDATE users SET status = 2 WHERE id = ${auth} `;
        await dbQuery(queryDeactive);

        const querySelect = `SELECT uid, status.status FROM users JOIN status ON status.id = users.status WHERE users.id = ${auth}`;
        const responsData = await dbQuery(querySelect);
        res.status(400).send({ uid: responsData[0].uid, status: "deactive" });
      }
    } catch (error) {
      next(error);
    }
  },

  activate: async (req, res, next) => {
    try {
      console.log("activate");
      const auth = req.user.id;
      // console.log(auth)

      const queryGetData = `SELECT * FROM users WHERE id = ${auth}`;
      const dataUserValidation = await dbQuery(queryGetData);
      console.log(dataUserValidation[0].status);
      if (dataUserValidation[0].status == 3) {
        res.status(400).send({
          message: "Akun sudah tidak aktif, tidak dapat mengakses kembali!",
        });
      } else if (dataUserValidation[0].status == 1) {
        res.status(400).send({ message: "Akun sudah aktif!" });
      } else {
        const queryActivate = `UPDATE users SET status = 1 WHERE id = ${auth} `;
        await dbQuery(queryActivate);

        const querySelect = `SELECT uid, status.status FROM users JOIN status ON status.id = users.status WHERE users.id = ${auth}`;
        const responseData = await dbQuery(querySelect);
        res.status(400).send(responseData);
      }
    } catch (error) {
      next(error);
    }
  },

  close: async (req, res, next) => {
    try {
      console.log("Go to activate");
      const auth = req.user.id;

      const queryClose = `UPDATE users SET status = 3 WHERE id = ${auth} `;
      await dbQuery(queryClose);

      const querySelect = `SELECT uid, status.status FROM users JOIN status ON status.id = users.status WHERE users.id = ${auth}`;
      const responseData = await dbQuery(querySelect);
      res.status(400).send(responseData[0]);
    } catch (error) {
      next(error);
    }
  },
};
