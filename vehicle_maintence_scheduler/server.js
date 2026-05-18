const express = require("express");
const dotenv = require("dotenv");
const getToken = require("./services/authService");
const {
  fetchDepots,
  fetchVehicles,
} = require("./services/fetchService");
const knapsack = require("./utils/knapsack");

dotenv.config();

const app = express();

app.get("/schedule", async (req, res) => {
  try {
    const token = await getToken();

    const depots = await fetchDepots(token);
    const vehicles = await fetchVehicles(token);

    const results = depots.map((depot) => {
      const result = knapsack(
        vehicles,
        depot.MechanicHours
      );

      return {
        depotId: depot.ID,
        mechanicHours: depot.MechanicHours,
        maxImpact: result.maxImpact,
        selectedVehicles: result.selectedVehicles,
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Server running`);
});