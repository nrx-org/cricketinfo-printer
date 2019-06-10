const Sequelize = require("sequelize");

let db = null;
let Screenshot = null;

const init = () => {
  db = new Sequelize({
    dialect: "sqlite",
    storage: "./screenshots.sqlite"
  });

  Screenshot = db.define("screenshot", {
    url: { type: Sequelize.STRING, allowNull: false },
    selector: { type: Sequelize.STRING },
    fileType: { type: Sequelize.STRING, allowNull: false },
    screenshotUrl: { type: Sequelize.STRING, allowNull: false },
    shortId: { type: Sequelize.STRING, allowNull: false }
  });

  return db.sync();
};

const saveScreenshot = fields => {
  if (!Screenshot) {
    return Promise.reject();
  }

  return Screenshot.create(fields);
};

const findScreenshot = fields => {
  if (!Screenshot) {
    return Promise.reject();
  }

  return Screenshot.findOne({
    where: fields
  });
};

module.exports = {
  init,
  saveScreenshot,
  findScreenshot
};
