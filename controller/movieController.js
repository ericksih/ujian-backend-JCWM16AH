const { db, dbQuery } = require("../config");

module.exports = {
  getAllMovie: async (req, res, next) => {
    try {
      const query = `select name, release_date, release_month, release_year, duration_min, genre, description, ms.status status, location, time from movies m
      left join movie_status ms
      on m.status = ms.id
      left join schedules s
      on m.id = s.movie_id
      left join locations l
      on s.location_id = l.id
      left join show_times st
      on s.time_id = st.id;`;

      const result = await dbQuery(query);
      res.status(200).send(result);
    } catch (err) {
      next(error);
    }
  },

  getCategory: async (req, res, next) => {
    try {
      const query = [];
      for (property in req.query) {
        if (property == "status") {
          query.push(
            `movie_status.${property} = ${db.escape(
              req.query[property].replace("%", " ")
            )}`
          );
        } else {
          query.push(
            `${property} = ${db.escape(req.query[property].replace("%", " "))}`
          );
        }
      }
      // console.log(query)
      const str = query.join(" AND ");
      // console.log(str)
      const queryMovies = `SELECT name, release_date, release_month, release_year, duration_min, genre, description, movie_status.status as status, location, time FROM movies JOIN movie_status ON movies.id = movie_status.id JOIN schedules ON movies.id = schedules.movie_id JOIN show_times ON schedules.time_id = show_times.id JOIN locations ON schedules.location_id = locations.id WHERE ${str}`;
      // console.log(queryMovies)
      const result = await dbQuery(queryMovies);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  },

  addMovie: async (req, res) => {
    const {
      name,
      release_date,
      release_month,
      release_year,
      duration_min,
      genre,
      description,
    } = req.body;
    try {
      const add = `insert into movies (name, release_date, release_month,release_year, duration_min, genre, description) 
        values (${db.escape(name)}, ${db.escape(release_date)}, ${db.escape(
        release_month
      )}, ${db.escape(release_year)},
        ${db.escape(duration_min)}, ${db.escape(genre)}, ${db.escape(
        description
      )})`;
      await dbQuery(add);

      const query = `select name, release_date, release_month,release_year, duration_min, genre, description from movies where name = ${db.escape(
        name
      )}`;
      const result = await dbQuery(query);
      res.status(200).send(result[0]);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },

  edit: async (req, res, next) => {
    try {
      const auth = req.user;
      const id = req.params.id;
      console.log(auth);

      if (auth.role == 1) {
        console.log("Admin");
        const result = `UPDATE movies SET status = ${req.body.status} WHERE id = ${id}`;
        await dbQuery(result);

        res.status(200).send({ id: id, message: "status has been changed" });
      } else {
        res.status(200).send("Permission denied, just Admin!");
      }
    } catch (error) {
      next(error);
    }
  },

  set: async (req, res, next) => {
    try {
      const auth = req.user;
      const id = req.params.id;
      console.log("Go to schedule", id);
      if (auth.role == 1) {
        console.log("Admin");
        const result = `INSERT INTO schedules (movie_id, location_id, time_id) VALUES (${id}, ${req.body.location_id}, ${req.body.time_id}) `;
        await dbQuery(result);

        res.status(200).send({ id: id, message: "schedule has been added" });
      } else {
        res.status(200).send("Permission denied, just Admin!");
      }
    } catch (error) {
      next(error);
    }
  },
};
