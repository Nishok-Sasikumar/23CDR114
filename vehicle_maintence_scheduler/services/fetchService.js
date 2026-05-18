const axios = require("axios");
async function fetchDepots(token) {
  const response = await axios.get(
    "http://4.224.186.213/evaluation-service/depots",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.depots;
}
async function fetchVehicles(token) {
  const response = await axios.get(
    "http://4.224.186.213/evaluation-service/vehicles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.vehicles;
}
module.exports = {
  fetchDepots,
  fetchVehicles,
};