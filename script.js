const container = document.getElementById("visual");

const minTipChord = 65; // mm
const maxChord = 1500; // mm
const maxSpan = 3000; // mm
const centreOfMass = 0.3994; // For all NACA symmetric airfoils i.e. NACA0020 or NACA0012
const aeroCentre = 0.25; // For all NACA symmetric airfoils i.e. NACA0020 or NACA0012
const airfoilType = 20;
const EEPDensity = 20;
const avgTickness = 0.274033;

const form = document.getElementById("form");
const labelArea = document.getElementById("area");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  container.innerHTML = "";

  const halfWingspan = Math.min(e.target[0].value, maxSpan); //mm
  const rootChord = Math.min(e.target[2].value, maxChord); // mm
  const tipChord = Math.min(maxChord, Math.max(e.target[3].value, minTipChord)); // mm

  const maxAngle = Math.atan((maxChord - tipChord) / halfWingspan) - (0.5 * Math.PI) / 180; // rad
  const sweepAngleRad = Math.min(degToRad(e.target[1].value), maxAngle); // rad

  const points = [
    { x: 0, y: 0 },
    { x: halfWingspan, y: halfWingspan * Math.tan(sweepAngleRad) },
    { x: halfWingspan, y: halfWingspan * Math.tan(sweepAngleRad) + tipChord },
    { x: 0, y: rootChord },
    { x: -1 * halfWingspan, y: halfWingspan * Math.tan(sweepAngleRad) + tipChord },
    { x: -1 * halfWingspan, y: halfWingspan * Math.tan(sweepAngleRad) },
  ];

  points.forEach((point, idx) => {
    const div = document.createElement("div");
    div.style.cssText = `--x: ${point.x}; --y: ${point.y}`;
    div.classList.add("point");
    container.appendChild(div);

    const line = document.createElement("div");
    line.classList.add("line");
    let nextPoint = points[idx + 1];
    if (!nextPoint) {
      nextPoint = { x: 0, y: 0 };
    }
    const slope = Math.atan((nextPoint.y - point.y) / (nextPoint.x - point.x));
    const length = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
    line.style.cssText = `--angle: ${radToDeg(slope)}; --length: ${length}; --posX:${point.x}; --posY: ${
      point.y
    }; transform-origin: ${nextPoint.x < point.x ? "right" : "left"}; 
    --offsetX: ${nextPoint.x < point.x ? `${length * -1}` : "0"}
    `;
    container.appendChild(line);
  });

  const CG =
    (1 / halfWingspan) *
    (((halfWingspan * Math.tan(sweepAngleRad) + centreOfMass * (tipChord - rootChord)) * Math.pow(halfWingspan, 2)) /
      (2 * halfWingspan) +
      centreOfMass * rootChord * halfWingspan);

  const AC =
    (1 / halfWingspan) *
    (((halfWingspan * Math.tan(sweepAngleRad) + aeroCentre * (tipChord - rootChord)) * Math.pow(halfWingspan, 2)) /
      (2 * halfWingspan) +
      aeroCentre * rootChord * halfWingspan);

  const CGPoint = document.createElement("div");
  CGPoint.style.cssText = `--x: ${0}; --y: ${CG}`;
  CGPoint.classList.add("point", "cg");
  container.appendChild(CGPoint);

  const ACPoint = document.createElement("div");
  ACPoint.style.cssText = `--x: ${0}; --y: ${AC}`;
  ACPoint.classList.add("point", "ac");
  container.appendChild(ACPoint);

  const area = calcPolygonArea(points);
  const weight = (rootChord * avgTickness * halfWingspan * EEPDensity * Math.pow(10, -6) + 12.8) / 1000;
  const weightInN = weight * 9.80665;
  const lift = 0.5 * 1.225225 * Math.pow(3, 2) * area * Math.pow(10, -6) * 0.4;
  const liftToWeight = (lift / weightInN).toFixed(2);

  labelArea.innerText = `Weight: ${weightInN.toFixed(2)}N  Lift: ${lift.toFixed(
    2
  )}N  L/W: ${liftToWeight}  Area: ${area}mm²`;

  const dimensions = document.createElement("div");
  dimensions.classList.add("dimensions-box");
  dimensions.style.cssText = `--x: ${halfWingspan}; --y: ${halfWingspan * Math.tan(sweepAngleRad) + tipChord}`;
  const labelSpan = document.createElement("div");
  labelSpan.innerText = `${halfWingspan}mm`;
  labelSpan.style.cssText = `--label: ${halfWingspan}`;
  const labelTip = document.createElement("div");
  labelTip.innerText = `${tipChord}mm`;
  labelTip.style.cssText = `--label: ${tipChord}`;
  const labelRoot = document.createElement("div");
  labelRoot.innerText = `${rootChord}mm`;
  labelRoot.style.cssText = `--label: ${rootChord}`;
  const labelAC = document.createElement("div");
  labelAC.innerText = `${AC.toFixed(1)}mm (ac/np)`;
  labelAC.style.cssText = `--label: ${AC}`;
  const labelCG = document.createElement("div");
  labelCG.innerText = `${CG.toFixed(1)}mm (cg)`;
  labelCG.style.cssText = `--label: ${CG}`;
  const labelSweep = document.createElement("div");
  labelSweep.innerText = `${radToDeg(sweepAngleRad).toFixed(1)}°`;
  dimensions.appendChild(labelSpan);
  dimensions.appendChild(labelTip);
  dimensions.appendChild(labelRoot);
  dimensions.appendChild(labelAC);
  dimensions.appendChild(labelCG);
  dimensions.appendChild(labelSweep);
  container.appendChild(dimensions);
});

function degToRad(x) {
  return (x * Math.PI) / 180;
}

function radToDeg(x) {
  return (x / Math.PI) * 180;
}

function calcPolygonArea(points) {
  var area = 0;
  var numCoords = points.length;

  for (var i = 0; i < numCoords; i++) {
    nexti = (i + 1) % numCoords; //make last+1 wrap around to zero
    area += points[i].x * points[nexti].y - points[i].y * points[nexti].x;
  }
  return Math.abs(area / 2);
}
