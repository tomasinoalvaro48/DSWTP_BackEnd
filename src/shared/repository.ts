<<<<<<< HEAD
export interface Repository<T> {
  findAll(): T[] | undefined
  findOne(item: { id: string | number }): T | undefined
  add(item: T): T | undefined
  update(item: T): T | undefined
  remove(item: { id: string | number }): T | undefined
}
=======
export interface Repository<T>{
    findAll(): T[] | undefined
    findOne(item: {id: string | number}): T | undefined
    add(item: T): T | undefined
    update(item: T): T | undefined
    remove(item:  {id: string | number}): T | undefined
}
>>>>>>> crud-usuario-v1
