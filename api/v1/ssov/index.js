const { SSOVS } = require("../../../helpers/constants");

module.exports = async (req, res) => {
  try {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    // const data =  Promise.all(
    //   Object.keys(SSOVS).map((key) => {
    //     return STUFF[]
    //   })
    // );

    res.json({ ...SSOVS });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};
