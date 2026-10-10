const query =
  '[out:json][timeout:10];node[amenity=hospital]' +
  '(around:5000,10.2314,76.4091);out;';

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 20000);

try {
  const started = Date.now();

  const response = await fetch(
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "VeAssist/1.0",
      },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    }
  );

  console.log("HTTP status:", response.status);
  console.log("Elapsed ms:", Date.now() - started);
  console.log(
    "Response:",
    (await response.text()).slice(0, 1000)
  );
} catch (error) {
  console.error("Error:", error.name, error.message);
} finally {
  clearTimeout(timer);
}