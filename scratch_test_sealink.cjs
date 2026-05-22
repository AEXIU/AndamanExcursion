

async function testSealinkAPI() {
    const url = "http://api.gonautika.com/getTripData";
    const body = {
        date: "20-5-2026", // some future date
        from: "Port Blair",
        to: "Swaraj Dweep",
        userName: "AndamanExcursionOnline",
        token: "U2FsdGVkX19cRJ2bFlgnzU9gVNrqfm6oSk99yI4OxGgEbeIPsTFH4iaNyNxTWuJuKunadb+ELqeyIXBka/BN5OntVaQRh4ixfabI59TxYRs="
    };

    console.log("Requesting: ", url);
    console.log("Body: ", body);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        console.log("Status: ", response.status);
        
        try {
            const data = JSON.parse(text);
            console.log("Response JSON: ", JSON.stringify(data).substring(0, 500));
            if (data && data.data && Array.isArray(data.data)) {
                console.log(`Found ${data.data.length} trips.`);
                data.data.forEach(trip => {
                    console.log(`Trip ID: ${trip.id}, Vessel ID: ${trip.vesselID}, Time: ${trip.dTime?.hour}:${trip.dTime?.minute}`);
                });
            } else {
                console.log("No trips array found. Error:", data.err);
            }
        } catch (e) {
            console.log("Response is not JSON. Text:", text.substring(0, 200));
        }
    } catch (err) {
        console.log("Fetch error: ", err.message);
        console.log("Cause: ", err.cause);
    }
}

testSealinkAPI();
