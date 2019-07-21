const bcrypt = require('bcrypt');

module.exports = (app) => {
    const endpointName = `${global.config.api}/auth`;

    app.post(endpointName, async (req, res) => {
        const user = req.body;
        try {
            const userQuery = await pool.query(
                `SELECT id, email, password, account_type
                FROM users
                WHERE email = '${user.email}'`
            );
            if (userQuery.rows.length) {
                const validPass = await bcrypt.compare(user.password, userQuery.rows[0].password);
                if (validPass) {
                    delete userQuery.rows[0].password;
                    global.util.res(res, true, `Authenticated successfully.`, userQuery.rows[0]);
                } else global.util.res(res, false, `Invalid password.`);
            } else {
                global.util.res(res, false, `Could not authenticate.`);
            }
        } catch(err) {
            global.util.res(res, false, `Could not authenticate.`);
        }
    });
}