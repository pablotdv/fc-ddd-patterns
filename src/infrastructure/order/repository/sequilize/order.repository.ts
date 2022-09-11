import Order from "../../../../domain/checkout/entity/order";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItem from "../../../../domain/checkout/entity/order_item";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const orderItemsModel = await OrderItemModel.findAll({
      where: { order_id: entity.id },
    });

    orderItemsModel.forEach((orderItem) => {
      const itemEntity = entity.items.find((item) => item.id === orderItem.id);
      if (!itemEntity) {
        OrderItemModel.destroy({ where: { id: orderItem.id } });

        return;
      }

      if (itemEntity.quantity !== orderItem.quantity) {
        OrderItemModel.update(
          { quantity: itemEntity.quantity },
          { where: { id: itemEntity.id } }
        );
      }
    });

    entity.items.forEach((item) => {
      const itemModel = orderItemsModel.find(
        (orderItem) => orderItem.id === item.id
      );
      if (!itemModel) {
        OrderItemModel.create({
          id: item.id,
          order_id: entity.id,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
      }
    });

    OrderModel.update({
      total: entity.total()
    }, {
      where: {
        id: entity.id
      }
    })
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: {
        id,
      },
      include: ["items"],
      rejectOnEmpty: true,
    });
    const items = orderModel.items.map(item => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity));
    const orderResult = new Order(orderModel.id, orderModel.customer_id, items)
    return orderResult;
  }
  async findAll(): Promise<Order[]> {
    const ordersModel = await OrderModel.findAll({
      include: ["items"],
    });
    return ordersModel.map(orderModel => {
      const items = orderModel.items.map(item => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity));
      const orderResult = new Order(orderModel.id, orderModel.customer_id, items)
      return orderResult;
    });
  }
}
