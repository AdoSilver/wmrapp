export class Role{
    public id: number;
    public name: string;

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}

export class configurations{
    public cost_per_unit: number;
    public end_of_month: boolean;

    constructor(cost_per_unit: number, end_of_month: boolean){
        this.cost_per_unit = cost_per_unit;
        this.end_of_month = end_of_month;
    }
}

export class meter{
    public userId: string;
    public location: string;
    public type: string;

    constructor(userId: string, location: string, type: string){
        this.userId = userId;
        this.location = location;
        this.type = type;
    }
}

export class Reading{
    public year: number;
    public month: number;
    public units: string;
    public absUnits: string;
    public photo: string;
    public amount: string;
    public key: string;

    constructor(key: string, year: number, month: number, units: string, absUnits: string, photo: string, amount: string){
        this.key = key;
        this.year = year;
        this.month = month;
        this.units = units;
        this.absUnits = absUnits;
        this.photo = photo;
        this.amount = amount;
    }
}

