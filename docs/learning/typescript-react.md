## Types and interfaces
TypeScript checks types as you write them and will give errors if inconsistent type are used.
Interfaces similar to classes but just describe individual objects of a certain shape, does not have a constructor or method code blocks but can list methods that exist - useful for plain data like towns and function inputs. When behaviour and data are both needed, a class is a better option.
Any object with the correct shape will fit - structural typing so implement or new are not needed.
e.g.
interface Van {
    id: string;
    capacityKg: number;
    status: string;
}
const luton: Van = { id: 'AK69ZTO', capacityKg: 750, status: 'idle' };

## Union types
Union types allow you to specify a list of allowed types rather than using 'any' or limiting to one specific type. TypeScript checks this as you write them and also uses type narrowing in conditional blocks, so as to not show errors when one type has already been handled.
e.g.
type VanStatus = 'idle' | 'loading' | 'driving';

interface Van {
    id: string;
    capacityKg: number;
    status: VanStatus;
}

function describeStatus(status: VanStatus): string {
    switch (status) {
        case 'idle':
            return "Van is idle."
        case 'loading':
            return "Van is loading."
        case 'driving':
            return "Van is driving."
    }
}

type Deadline = number | 'none';

function formatDeadline(deadline: Deadline): string {
    if (deadline === 'none') {
        return "No deadline";
    } else {
        return `Due in ${deadline} minutes`;
    }
}

## Typing function parameters and return values

## React components and props

## useState

## useEffect

## Still unclear

## Time spent