const multer = require('multer');
const multers3 = require('multer-s3');

module.exports = (app) => {
    const endpointName = `${global.config.api}/schools`;

    const upload = multer({
        storage: multers3({
            s3: global.AWSS3,
            bucket: 'jesse-schools',
            metadata: function(req, file, cb) {
                cb(null, {fieldName: file.fieldname});
            },
            key: function(req, file, cb) {
                const fileSplit = file.originalname.split('.');
                cb(null, `${Date.now().toString()}.${fileSplit[fileSplit.length - 1]}`);
            }
        })
    });

    app.post(endpointName, upload.single('image'), async (req, res) => {
        const {name, about, location, admission, educator_id} = req.body;
        try {
            if (req.file) {
                await pool.query(
                    `INSERT INTO schools (name, about, location, admission, image, educator_id)
                    VALUES ($1, $2, $3, $4, $5, $6)`,
                    [name, about, location, admission, req.file.key, educator_id]
                );
            } else {
                await pool.query(
                    `INSERT INTO schools (name, about, location, admission, educator_id)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [name, about, location, admission, educator_id]
                );
            }
            global.util.res(res, true, `Successfully added School.`);
        } catch(err) {
            global.util.res(res, false, `Failed to add School.`);
        }
    });

    app.patch(endpointName, upload.single('image'), async (req, res) => {
        const {id, name, about, location, admission, educator_id} = req.body;
        try {
            if (req.file) {
                await pool.query(
                    `UPDATE schools
                    SET
                        name = $1,
                        about = $2,
                        location = $3,
                        admission = $4,
                        image = $5
                    WHERE
                        id = $6
                    AND
                        educator_id = $7`,
                    [name, about, location, admission, req.file.key, parseInt(id), parseInt(educator_id)]
                );
            } else {
                await pool.query(
                    `UPDATE schools
                    SET
                        name = $1,
                        about = $2,
                        location = $3,
                        admission = $4
                    WHERE
                        id = $5
                    AND
                        educator_id = $6`,
                    [name, about, location, admission, parseInt(id), parseInt(educator_id)]
                );
            }
            global.util.res(res, true, `Successfully updated School.`);
        } catch(err) {
            global.util.res(res, false, `Failed to update School.`);
        }
    });

    app.get(endpointName, async (req, res) => {
        try {
            const query = await pool.query(
                `SELECT id, name, image
                FROM schools`
            );
            global.util.res(res, true, `Successfully retrieved Schools.`, query.rows);
        } catch(err) {
            global.util.res(res, false, `Failed to retrieve Schools.`);
        }
    });

    app.get(`${endpointName}/:id`, async (req, res) => {
        try {
            const id = req.params.id;
            const query = await pool.query(
                `SELECT *
                FROM schools
                WHERE id = ${id}`
            );
            if (query.rows.length) {
                global.util.res(res, true, `Successfully retrieved School.`, query.rows[0]);
            } else {
                global.util.res(res, false, `Failed to find School with ID.`);
            }
        } catch(err) {
            global.util.res(res, false, `Failed to retrieve School.`);
        }
    });
}