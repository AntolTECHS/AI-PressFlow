import natural from "natural";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_PATH = path.join(__dirname, "categoryModel.json");

const classifier = new natural.LogisticRegressionClassifier();

function trainModel() {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "training_news_data.json"))
  );

  data.forEach(item => {
    classifier.addDocument(item.text, item.label);
  });

  classifier.train();
  classifier.save(MODEL_PATH, () => {
    console.log("Category model trained & saved.");
  });
}

// Load if exists, else train
if (fs.existsSync(MODEL_PATH)) {
  classifier.load(MODEL_PATH, null);
} else {
  trainModel();
}

export function categorize(text) {
  const label = classifier.classify(text);
  const details = classifier.getClassifications(text);

  return {
    category: label,
    confidence: details[0]?.value || 0.5
  };
}
