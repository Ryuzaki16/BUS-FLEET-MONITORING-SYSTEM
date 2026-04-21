import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4f5edd33/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== BUS ENDPOINTS ====================

// Get all buses
app.get("/make-server-4f5edd33/buses", async (c: any) => {
  try {
    const buses = await kv.getByPrefix("bus:");
    return c.json({ success: true, data: buses });
  } catch (error) {
    console.log("Error fetching buses:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single bus
app.get("/make-server-4f5edd33/buses/:id", async (c: any) => {
  try {
    const id = c.req.param("id");
    const bus = await kv.get(`bus:${id}`);
    if (!bus) {
      return c.json({ success: false, error: "Bus not found" }, 404);
    }
    return c.json({ success: true, data: bus });
  } catch (error) {
    console.log("Error fetching bus:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or update bus
app.post("/make-server-4f5edd33/buses", async (c: any) => {
  try {
    const body = await c.req.json();
    const { id, ...busData } = body;
    
    if (!id) {
      return c.json({ success: false, error: "Bus ID is required" }, 400);
    }

    await kv.set(`bus:${id}`, { id, ...busData, updatedAt: new Date().toISOString() });
    return c.json({ success: true, data: { id, ...busData } });
  } catch (error) {
    console.log("Error creating/updating bus:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete bus
app.delete("/make-server-4f5edd33/buses/:id", async (c: any) => {
  try {
    const id = c.req.param("id");
    await kv.del(`bus:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting bus:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update bus location (GPS tracking)
app.put("/make-server-4f5edd33/buses/:id/location", async (c: any) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { lat, lng } = body;

    if (lat === undefined || lng === undefined) {
      return c.json({ success: false, error: "Latitude and longitude are required" }, 400);
    }

    const bus = await kv.get(`bus:${id}`);
    if (!bus) {
      return c.json({ success: false, error: "Bus not found" }, 404);
    }

    const updatedBus = {
      ...bus,
      location: { lat, lng },
      lastLocationUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`bus:${id}`, updatedBus);
    return c.json({ success: true, data: updatedBus });
  } catch (error) {
    console.log("Error updating bus location:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get bus alert
app.get("/make-server-4f5edd33/buses/:id/alert", async (c) => {
  try {
    const id = c.req.param("id");
    const alert = await kv.get(`bus_alert:${id}`);
    return c.json({ success: true, data: alert || null });
  } catch (error) {
    console.log("Error fetching bus alert:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Set bus alert
app.post("/make-server-4f5edd33/buses/:id/alert", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const alertData = {
      ...body,
      busId: id,
      timestamp: new Date().toISOString()
    };
    await kv.set(`bus_alert:${id}`, alertData);
    return c.json({ success: true, data: alertData });
  } catch (error) {
    console.log("Error setting bus alert:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clear bus alert
app.delete("/make-server-4f5edd33/buses/:id/alert", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`bus_alert:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error clearing bus alert:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TRIP ENDPOINTS ====================

// Get all trips
app.get("/make-server-4f5edd33/trips", async (c) => {
  try {
    const trips = await kv.getByPrefix("trip:");
    return c.json({ success: true, data: trips });
  } catch (error) {
    console.log("Error fetching trips:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get single trip
app.get("/make-server-4f5edd33/trips/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const trip = await kv.get(`trip:${id}`);
    if (!trip) {
      return c.json({ success: false, error: "Trip not found" }, 404);
    }
    return c.json({ success: true, data: trip });
  } catch (error) {
    console.log("Error fetching trip:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get ongoing trips
app.get("/make-server-4f5edd33/trips/status/ongoing", async (c) => {
  try {
    const allTrips = await kv.getByPrefix("trip:");
    const ongoingTrips = allTrips.filter((trip: any) => trip.status === 'ongoing');
    return c.json({ success: true, data: ongoingTrips });
  } catch (error) {
    console.log("Error fetching ongoing trips:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create trip (Start Trip)
app.post("/make-server-4f5edd33/trips", async (c) => {
  try {
    const body = await c.req.json();
    const { id, busId, ...tripData } = body;
    
    if (!id || !busId) {
      return c.json({ success: false, error: "Trip ID and Bus ID are required" }, 400);
    }

    const newTrip = {
      id,
      busId,
      ...tripData,
      status: 'ongoing',
      stops: [],
      passengersBoarded: 0,
      totalFare: 0,
      startTime: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await kv.set(`trip:${id}`, newTrip);
    
    // Update bus with current trip
    const bus = await kv.get(`bus:${busId}`);
    if (bus) {
      await kv.set(`bus:${busId}`, { ...bus, currentTrip: id, status: 'active' });
    }

    return c.json({ success: true, data: newTrip });
  } catch (error) {
    console.log("Error creating trip:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// End trip
app.put("/make-server-4f5edd33/trips/:id/end", async (c) => {
  try {
    const id = c.req.param("id");
    const trip = await kv.get(`trip:${id}`);
    
    if (!trip) {
      return c.json({ success: false, error: "Trip not found" }, 404);
    }

    const updatedTrip = {
      ...trip,
      status: 'completed',
      endTime: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`trip:${id}`, updatedTrip);
    
    // Update bus status
    const bus = await kv.get(`bus:${trip.busId}`);
    if (bus) {
      await kv.set(`bus:${trip.busId}`, { ...bus, currentTrip: undefined, status: 'idle', currentPassengers: 0 });
    }

    return c.json({ success: true, data: updatedTrip });
  } catch (error) {
    console.log("Error ending trip:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update trip (add stop, passengers, etc.)
app.put("/make-server-4f5edd33/trips/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const trip = await kv.get(`trip:${id}`);
    
    if (!trip) {
      return c.json({ success: false, error: "Trip not found" }, 404);
    }

    const updatedTrip = {
      ...trip,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`trip:${id}`, updatedTrip);
    return c.json({ success: true, data: updatedTrip });
  } catch (error) {
    console.log("Error updating trip:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PASSENGER/TICKET ENDPOINTS ====================

// Get all passengers for a trip
app.get("/make-server-4f5edd33/trips/:tripId/passengers", async (c) => {
  try {
    const tripId = c.req.param("tripId");
    const passengers = await kv.getByPrefix(`passenger:${tripId}:`);
    return c.json({ success: true, data: passengers });
  } catch (error) {
    console.log("Error fetching passengers:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add passenger/issue ticket
app.post("/make-server-4f5edd33/trips/:tripId/passengers", async (c) => {
  try {
    const tripId = c.req.param("tripId");
    const body = await c.req.json();
    const { id, ...passengerData } = body;
    
    if (!id) {
      return c.json({ success: false, error: "Passenger ID is required" }, 400);
    }

    const newPassenger = {
      id,
      tripId,
      ...passengerData,
      timestamp: new Date().toISOString()
    };

    await kv.set(`passenger:${tripId}:${id}`, newPassenger);
    
    // Update trip stats
    const trip = await kv.get(`trip:${tripId}`);
    if (trip) {
      const count = passengerData.passengerCount ?? 1; // 👈 read from body
      const updatedTrip = {
        ...trip,
        passengersBoarded: (trip.passengersBoarded || 0) + count,           // 👈 was + 1
        totalFare: (trip.totalFare || 0) + (passengerData.fare || 0) * count, // 👈 multiply by count
      };
      await kv.set(`trip:${tripId}`, updatedTrip);

      if (trip.busId) {
        const bus = await kv.get(`bus:${trip.busId}`);
        if (bus) {
          await kv.set(`bus:${trip.busId}`, { ...bus, currentPassengers: updatedTrip.passengersBoarded });
        }
      }
    }

    return c.json({ success: true, data: newPassenger });
  } catch (error) {
    console.log("Error adding passenger:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Remove passenger
app.delete("/make-server-4f5edd33/trips/:tripId/passengers/:passengerId", async (c) => {
  try {
    const tripId = c.req.param("tripId");
    const passengerId = c.req.param("passengerId");
    
    const passenger = await kv.get(`passenger:${tripId}:${passengerId}`);
    await kv.del(`passenger:${tripId}:${passengerId}`);
    
    // Update trip stats
    if (passenger) {
      const trip = await kv.get(`trip:${tripId}`);
      if (trip) {
        const updatedTrip = {
          ...trip,
          passengersBoarded: Math.max(0, (trip.passengersBoarded || 0) - 1),
          totalFare: Math.max(0, (trip.totalFare || 0) - (passenger.fare || 0)),
        };
        await kv.set(`trip:${tripId}`, updatedTrip);
        
        // Update bus passenger count
        if (trip.busId) {
          const bus = await kv.get(`bus:${trip.busId}`);
          if (bus) {
            await kv.set(`bus:${trip.busId}`, { ...bus, currentPassengers: updatedTrip.passengersBoarded });
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error removing passenger:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== LOST AND FOUND ENDPOINTS ====================

// Get all lost items
app.get("/make-server-4f5edd33/lostitems", async (c) => {
  try {
    const items = await kv.getByPrefix("lostitem:");
    return c.json({ success: true, data: items });
  } catch (error) {
    console.log("Error fetching lost items:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create lost item
app.post("/make-server-4f5edd33/lostitems", async (c) => {
  try {
    const body = await c.req.json();
    const { id, ...itemData } = body;
    
    if (!id) {
      return c.json({ success: false, error: "Item ID is required" }, 400);
    }

    const newItem = {
      id,
      ...itemData,
      status: itemData.status || 'unclaimed',
      dateFound: itemData.dateFound || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await kv.set(`lostitem:${id}`, newItem);
    return c.json({ success: true, data: newItem });
  } catch (error) {
    console.log("Error creating lost item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update lost item
app.put("/make-server-4f5edd33/lostitems/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const item = await kv.get(`lostitem:${id}`);
    
    if (!item) {
      return c.json({ success: false, error: "Item not found" }, 404);
    }

    const updatedItem = {
      ...item,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`lostitem:${id}`, updatedItem);
    return c.json({ success: true, data: updatedItem });
  } catch (error) {
    console.log("Error updating lost item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete lost item
app.delete("/make-server-4f5edd33/lostitems/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`lostitem:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting lost item:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ROUTE ENDPOINTS ====================

// Get all routes
app.get("/make-server-4f5edd33/routes", async (c) => {
  try {
    const routes = await kv.getByPrefix("route:");
    return c.json({ success: true, data: routes });
  } catch (error) {
    console.log("Error fetching routes:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create route
app.post("/make-server-4f5edd33/routes", async (c) => {
  try {
    const body = await c.req.json();
    const { id, ...routeData } = body;
    
    if (!id) {
      return c.json({ success: false, error: "Route ID is required" }, 400);
    }

    const newRoute = {
      id,
      ...routeData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`route:${id}`, newRoute);
    return c.json({ success: true, data: newRoute });
  } catch (error) {
    console.log("Error creating route:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});


// ==================== FEEDBACK ENDPOINTS ====================

app.post("/make-server-4f5edd33/feedback", async (c: any) => {
  try {
    const body = await c.req.json();
    const { busId, name, driverRating, conductorRating, message } = body;

    if (!busId) return c.json({ success: false, error: "busId is required" }, 400);
    if (!driverRating || !conductorRating) return c.json({ success: false, error: "Ratings are required" }, 400);
    if (driverRating < 1 || driverRating > 5 || conductorRating < 1 || conductorRating > 5) {
      return c.json({ success: false, error: "Ratings must be between 1 and 5" }, 400);
    }

    const id = `${Date.now()}`;
    const feedbackData = {
      id,
      busId,
      name: name?.trim() || null,
      driverRating,
      conductorRating,
      message: message?.trim() || null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`feedback:${busId}:${id}`, feedbackData);
    return c.json({ success: true, data: feedbackData });
  } catch (error) {
    console.log("Error submitting feedback:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-4f5edd33/feedback/:busId", async (c: any) => {
  try {
    const busId = c.req.param("busId");
    const feedback = await kv.getByPrefix(`feedback:${busId}:`);
    return c.json({ success: true, data: feedback });
  } catch (error) {
    console.log("Error fetching feedback:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});


Deno.serve(app.fetch);