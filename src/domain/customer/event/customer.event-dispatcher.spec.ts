import EventDispatcher from "../../@shared/event/event-dispatcher";
import AddressChangedEvent from "./address.changed.event";
import CustomerCreatedEvent from "./customer.created.event";
import EnviaConsoleLogHandler from "./handler/envia-console-log-handler";
import EnviaConsoleLog1Handler from "./handler/envia-console-log1-handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log2-handler";

describe("Customer events tests", () => {
    it("should notify CustomerCreatedEvent handlers", () => {
        const eventDispatcher = new EventDispatcher();

        const enviaConsoleLog1Handler = new EnviaConsoleLog1Handler();
        const enviaConsoleLog2Handler = new EnviaConsoleLog2Handler();

        const spyEnviaConsoleLog1Handler = jest.spyOn(enviaConsoleLog1Handler, "handle");
        const spyEnviaConsoleLog2Handler = jest.spyOn(enviaConsoleLog2Handler, "handle");

        eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog1Handler);
        eventDispatcher.register("CustomerCreatedEvent", enviaConsoleLog2Handler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
        ).toMatchObject(enviaConsoleLog1Handler);

        expect(
            eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
        ).toMatchObject(enviaConsoleLog2Handler);

        const customerCreatedEvent = new CustomerCreatedEvent({
            id: "1",
            name: "Robson",
            street: "Street 1",
            number: 123,
            zipcode: "zip 1",
            city: "City 1",
            active: true,
            rewardPoints: 10
        });

        eventDispatcher.notify(customerCreatedEvent);

        expect(enviaConsoleLog1Handler.handle).toHaveBeenCalledWith(customerCreatedEvent)
        expect(enviaConsoleLog2Handler.handle).toHaveBeenCalledWith(customerCreatedEvent)
        expect(spyEnviaConsoleLog1Handler).toHaveBeenCalled();
        expect(spyEnviaConsoleLog2Handler).toHaveBeenCalled();
    });

    it("should notify AddressChangedEvent handlers", () => {
        const eventDispatcher = new EventDispatcher();

        const enviaConsoleLogHandler = new EnviaConsoleLogHandler();

        const spyEnviaConsoleLogHandler = jest.spyOn(enviaConsoleLogHandler, "handle");

        eventDispatcher.register("AddressChangedEvent", enviaConsoleLogHandler);

        expect(
            eventDispatcher.getEventHandlers["AddressChangedEvent"][0]
        ).toMatchObject(enviaConsoleLogHandler);

        const addressChangedEvent = new AddressChangedEvent({
            id: "1",
            name: "Robson",
            address: "Street 1, 123, Zip 1, City 1",
        });

        eventDispatcher.notify(addressChangedEvent);

        expect(enviaConsoleLogHandler.handle).toHaveBeenCalledWith(addressChangedEvent)
        expect(spyEnviaConsoleLogHandler).toHaveBeenCalled();
    });
});