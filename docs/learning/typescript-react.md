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
Typing parameters and return values means TypeScript is able to check for errors that you might miss from invalid return types of functions, where it returns a number which you try to interpret as a string for example. void is used when a function does not need to return anything so TypeScript does not show an error for a function not returning the specified type, while undefined is used when the function does need a return but the return may be different for example searching through a list for a specific item, if the item is not found then undefined would be returned.
e.g.
function formatPence(pence: number) {
    return `£${(pence / 100).toFixed(2)}`;
}

function jobPayPence(distanceKm: number, ratePencePerKm: number, bonusPence: number = 0): number {
    let jobPay: number = distanceKm * ratePencePerKm + bonusPence;
    return jobPay
}

function everyTick(minutes: number, onTick: (minute: number)) {
    for (let i = 1; i <= minutes; i++) {
        onTick(i);
    }
}

everyTick(3, (minute) => console.log(`Minute ${minute}`))

## React components and props
React components are TypeScript functions that return HTML elements, you can pass in props like variables to make more complex HTML elements. A component only takes in one variable - the props, which should be stored in its own interface, and can be accessed by props.attribute similar to a class but as the props are just data not methods it is better to use an interface.
e.g.
interface PanelProps {
    title: string;
}

function Panel (props: PanelProps) {
    return (
        <section>
            <h2>props.title</h2>
            {props.children}
        </section>
    )
}

## useState
useState allows components to "remember" variables so you can do things such as have selected items or keep track of a score etc. It takes an initial values and then you have a setXYZ function that takes the new value and updates it, storing it again to be used the next time it is called. The state is stored locally so even two identical components placed one after another work independently of one another. Calling the setter makes React re-render the component which is what allows for the update. The state value is fixed within each render, so calling setCount(count + 1) three times within one handle function will only update it once as each setCount call reads the same initial count value until the component is re-rendered. The initial value is only used once, on the very first render. Hooks must go at the top level of a component, not inside a nested function or a conditional loop.
e.g.
const [selectedId, setSelectedId] = useState<string | null>(null);

function handleSelectVan(id: string): void {
    setSelectedId(id);
}

## useEffect

## Still unclear

## Time spent