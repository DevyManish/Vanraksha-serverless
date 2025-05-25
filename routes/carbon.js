// routes/carbon.js
import express from 'express';
const router = express.Router();

// Emission factors (same data structure)
const EMISSION_FACTORS = {
    "India": {
        "Transportation": 0.14,
        "Electricity": 0.82,
        "Diet": 1.25,
        "Waste": 0.1
    },
    "United States": {
        "Transportation": 0.12,
        "Electricity": 0.65,
        "Diet": 1.3,
        "Waste": 0.09
    },
    // ... other countries
};

router.post('/carbon-footprint', (req, res) => {
    try {
        const { country, distance = 0, electricity = 0, meals = 0, waste = 0 } = req.body;

        // Validate country
        if (!EMISSION_FACTORS[country]) {
            return res.status(400).json({ error: "Invalid country selected" });
        }

        // Convert daily/weekly inputs to annual
        const annualValues = {
            distance: distance * 365,
            electricity: electricity * 12,
            meals: meals * 365,
            waste: waste * 52
        };

        // Get factors for the country
        const factors = EMISSION_FACTORS[country];

        // Calculate emissions (kg)
        const calculations = {
            transportation: factors.Transportation * annualValues.distance,
            energy: factors.Electricity * annualValues.electricity,
            food: factors.Diet * annualValues.meals,
            waste: factors.Waste * annualValues.waste
        };

        // Convert to metric tons and round
        const result = Object.entries(calculations).reduce((acc, [key, value]) => {
            acc[`${key}_emissions`] = Math.round((value / 1000) * 100) / 100;
            return acc;
        }, {});

        result.total_emissions = Math.round(
            Object.values(calculations).reduce((sum, val) => sum + val, 0) / 1000 * 100
        ) / 100;

        res.json(result);

    } catch (error) {
        console.error('Carbon calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate footprint' });
    }
});

export default router;