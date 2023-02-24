import { prisma } from "./db";

export const getAllScopes = async (rootScope : string | undefined) => {
    if (!rootScope) return [] as String[]

    const scopes = await prisma.scope.findMany({
        where: {id: rootScope},
        // MAX SIX LEVELS OF SCOPE
        include: {
            children: { include : {
                children: { include : {
                    children: { include : {
                        children: { include : {
                            children: { include : {
                                children: true
                            }}
                        }}
                    }}
                }}
            }}
        }
    });

    // Recursively flatten the scope tree
    const flattenObject = (obj : typeof scopes) => {
            var result : String[] = [];
            obj.forEach(function (a) {
                result.push(a.id);
                if (Array.isArray(a.children)) {
                    result = result.concat(flattenObject(a.children));
                }
            });
            return result;
    }

    if (scopes){
        return flattenObject(scopes)
    }else{
        return [] as String[]
    }
}
  