import { relations as authRelations } from "../auth.db"
import { tfeRelations } from "../tfe.db"

export const relations = {
    ...authRelations,
    ...tfeRelations
};