const BASE_URL = "https://stage-web.makruzz.com/booking_api/";
const USERNAME = "testagent@xgenmedia.com";
const PASSWORD = "test@123";

async function run() {
  const loginResp = await fetch(`${BASE_URL}login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { username: USERNAME, password: PASSWORD } }),
  });
  const token = (await loginResp.json()).data.token;

  const searchResp = await fetch(`${BASE_URL}schedule_search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Mak_Authorization": token },
    body: JSON.stringify({ 
      data: { trip_type: "single_trip", from_location: "1", to_location: "2", travel_date: "2026-04-20", no_of_passenger: "2" } 
    }),
  });
  const schedules = (await searchResp.json()).data || [];

  const statuses = new Set();
  
  for (const s of schedules) {
    const seatResp = await fetch(`${BASE_URL}get_seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Mak_Authorization": token },
      body: JSON.stringify({ 
        data: { schedule_id: s.id.toString(), class_id: s.ship_class_id.toString(), travel_date: "2026-04-20" }
      }),
    });
    const seatData = await seatResp.json();
    if (seatData.data) {
      for (const seat of seatData.data) {
        statuses.add(seat.status);
      }
    }
  }
  
  console.log("Found seat statuses:", Array.from(statuses));
}

run().catch(console.error);
