export interface Store {
    storeID: number;
    distance: number;
    address: {
        line1: string,
        city: string,
        state: string
        postalCode: number;
    }
    city: string;
    state: string;
    postalCode: number;
}

export interface MenuItem {
    category: string;
    name: string;
    price: number;
}

export interface StoreMenuDict {
    store: Store;
    menu: MenuItem[];
}