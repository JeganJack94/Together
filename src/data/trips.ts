import type { Timestamp } from 'firebase/firestore';

export interface TripMember {
  id: string;
  email: string;
  name?: string;
  isOwner: boolean;
}

export interface Trip {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalBudget: number;
  categoryBudgets: {[key: string]: number};
  members: TripMember[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Helper function types
type FirestoreData = {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalBudget?: number;
  categoryBudgets?: {[key: string]: number};
  members?: TripMember[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

type FirestoreDoc = {
  id: string;
  data: () => FirestoreData;
};

// Convert a Firestore doc to a Trip object
export const convertFirestoreTrip = (doc: FirestoreDoc): Trip => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    totalBudget: data.totalBudget || 0,
    categoryBudgets: data.categoryBudgets || {},
    members: data.members || [],
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

// Example data for trips
export const activeTrips = [
	{
		id: 1,
		name: 'Paris Getaway',
		dateRange: 'May 20 - May 27, 2025',
		budget: 3000,
		spent: 1250,
		members: 4,
		image: 'https://readdy.ai/api/search-image?query=Beautiful%20Paris%20cityscape%20with%20Eiffel%20Tower%20at%20sunset%2C%20romantic%20atmosphere%2C%20tourist%20destination%2C%20iconic%20landmark%2C%20vibrant%20colors%2C%20clear%20sky%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20view&width=400&height=200&seq=1&orientation=landscape'
	},
	{
		id: 2,
		name: 'Tokyo Adventure',
		dateRange: 'June 5 - June 15, 2025',
		budget: 5000,
		spent: 2100,
		members: 2,
		image: 'https://readdy.ai/api/search-image?query=Tokyo%20cityscape%20with%20Mount%20Fuji%20in%20background%2C%20modern%20skyscrapers%2C%20cherry%20blossoms%2C%20vibrant%20street%20life%2C%20neon%20lights%2C%20clear%20blue%20sky%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=400&height=200&seq=2&orientation=landscape'
	},
	{
		id: 3,
		name: 'Bali Retreat',
		dateRange: 'July 10 - July 20, 2025',
		budget: 4000,
		spent: 800,
		members: 6,
		image: 'https://readdy.ai/api/search-image?query=Tropical%20Bali%20beach%20paradise%20with%20palm%20trees%2C%20crystal%20clear%20turquoise%20water%2C%20white%20sand%2C%20traditional%20boats%2C%20lush%20greenery%2C%20sunset%20colors%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20tropical%20view&width=400&height=200&seq=3&orientation=landscape'
	}
];

export const upcomingTrips = [
	{
		id: 4,
		name: 'New York City',
		dateRange: 'August 15 - August 22, 2025',
		budget: 6000,
		image: 'https://readdy.ai/api/search-image?query=New%20York%20City%20skyline%20with%20Empire%20State%20Building%2C%20Central%20Park%2C%20yellow%20taxis%2C%20busy%20streets%2C%20blue%20sky%20with%20few%20clouds%2C%20daytime%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=80&height=80&seq=4&orientation=squarish'
	},
	{
		id: 5,
		name: 'Barcelona',
		dateRange: 'September 3 - September 10, 2025',
		budget: 3500,
		image: 'https://readdy.ai/api/search-image?query=Barcelona%20cityscape%20with%20Sagrada%20Familia%2C%20Mediterranean%20coast%2C%20Spanish%20architecture%2C%20palm%20trees%2C%20blue%20sky%2C%20sunny%20day%2C%20travel%20photography%20style%2C%20high%20resolution%2C%20professional%20lighting%2C%20scenic%20urban%20view&width=80&height=80&seq=5&orientation=squarish'
	}
];

export const tripHistory = [
	{
		id: 6,
		name: 'Swiss Alps',
		dateRange: 'Feb 10 - Feb 17, 2025',
		budget: 4250,
		status: 'Under budget'
	}
];
