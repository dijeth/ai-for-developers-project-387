module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:7860",
        "http://localhost:7860/booking",
        "http://localhost:7860/admin",
      ],
    },
    numberOfRuns: 5,
    settings: {
      chromeFlags: "--no-sandbox --headless",
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
