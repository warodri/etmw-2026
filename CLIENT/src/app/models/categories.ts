export interface CategoryModel {
    
    _id: string,
    name: string,
    icon?: string,
    parentId?: string | { _id: string, name: string } | null,
    count?: number,
    gradient: string,

}
