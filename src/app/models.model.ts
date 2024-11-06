export interface Store {
    storeID: number;
    distance: number;
    address: string;
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