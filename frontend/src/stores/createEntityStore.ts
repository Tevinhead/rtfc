import { StateCreator } from 'zustand';

/** 
 * Define a minimal interface for your API. 
 * You might have slightly different naming or additional methods, 
 * but the idea is that createEntityStore just needs to know how 
 * to do the 5 major CRUD ops plus maybe a custom "getStats".
 */
export interface EntityApi<T> {
  getAll: () => Promise<T[]>;
  getById?: (id: string) => Promise<T>; 
  create?: (data: Partial<T>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  /** If you have custom endpoints like getStats, put them here. */
}

export interface EntityState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchOne?: (id: string) => Promise<void>;
  createItem?: (data: Partial<T>) => Promise<void>;
  updateItem?: (id: string, data: Partial<T>) => Promise<void>;
  deleteItem?: (id: string) => Promise<void>;
}

/**
 * This is the actual factory function that creates a slice of Zustand state 
 * for a given entity type `T`. 
 *
 * It receives an `entityName` (for better error messages) and an `api` 
 * object that knows how to perform the CRUD calls on that entity.
 */
export function createEntityStore<T>(
  entityName: string,
  api: EntityApi<T>
): StateCreator<
  EntityState<T>, // the slice we are creating
  [],
  [],
  EntityState<T>
> {
  return (set, get) => ({
    items: [],
    loading: false,
    error: null,

    // Fetch all
    fetchAll: async () => {
      set({ loading: true, error: null });
      try {
        const data = await api.getAll();
        set({
          items: data,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error(`Failed to fetchAll ${entityName}:`, err);
        set({
          error: `Failed to fetch ${entityName}`,
          loading: false,
        });
      }
    },

    // Optional: Fetch one
    fetchOne: api.getById
      ? async (id: string) => {
          set({ loading: true, error: null });
          try {
            const item = await api.getById!(id);
            // if you want to store this single item in items[], 
            // you can push or replace an existing item.
            const existingItems = get().items;
            const index = existingItems.findIndex((x: any) => (x.id || x._id) === id);
            if (index !== -1) {
              existingItems[index] = item;
            } else {
              existingItems.push(item);
            }
            set({
              items: [...existingItems],
              loading: false,
              error: null,
            });
          } catch (err) {
            console.error(`Failed to fetchOne ${entityName}:`, err);
            set({
              error: `Failed to fetch one ${entityName}`,
              loading: false,
            });
          }
        }
      : undefined,

    // Optional: Create
    createItem: api.create
      ? async (data: Partial<T>) => {
          set({ loading: true, error: null });
          try {
            const newItem = await api.create!(data);
            set({
              items: [...get().items, newItem],
              loading: false,
              error: null,
            });
          } catch (err) {
            console.error(`Failed to create ${entityName}:`, err);
            set({
              error: `Failed to create ${entityName}`,
              loading: false,
            });
          }
        }
      : undefined,

    // Optional: Update
    updateItem: api.update
      ? async (id: string, data: Partial<T>) => {
          set({ loading: true, error: null });
          try {
            const updatedItem = await api.update!(id, data);
            set((state) => ({
              items: state.items.map((i: any) => {
                if ((i.id || i._id) === id) {
                  return updatedItem;
                }
                return i;
              }),
              loading: false,
              error: null,
            }));
          } catch (err) {
            console.error(`Failed to update ${entityName}:`, err);
            set({
              error: `Failed to update ${entityName}`,
              loading: false,
            });
          }
        }
      : undefined,

    // Optional: Delete
    deleteItem: api.delete
      ? async (id: string) => {
          set({ loading: true, error: null });
          try {
            await api.delete!(id);
            set((state) => ({
              items: state.items.filter((i: any) => (i.id || i._id) !== id),
              loading: false,
              error: null,
            }));
          } catch (err) {
            console.error(`Failed to delete ${entityName}:`, err);
            set({
              error: `Failed to delete ${entityName}`,
              loading: false,
            });
          }
        }
      : undefined,
  });
}
