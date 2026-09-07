const today = new Date();

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

document.getElementById("currentDate").textContent =
  dateFormatter.format(today);