import { ASSET_TYPE, IAsset, SOURCE_TYPE } from "@desp-aas/desp-ui-fwk";


export const testCourses: IAsset[] = [
    {
        id: "81337471-43f8-42b9-8cf8-ddd47f86a795", name: 'Course 1', source: SOURCE_TYPE['external'], type: ASSET_TYPE['course'], 
        categoryId: 1,
        metadata: {
            description: 'this is an awesome cours, learn how to use LLMs super fast'
        }
    },
    {
        id: "81337471-43f8-42b9-8cf8-ddd47f86a795", 
        source: SOURCE_TYPE['external'], type: ASSET_TYPE['course'], 
        categoryId: 1,
        // name: 'SAR Basics for SAR Tomography', 
        name: 'ESA Polarimetry Training 2023 #1 SAR Basics for SAR Tomography with Prof. Stefano Tebaldini', 
        metadata: {
            externalURL: 'https://www.youtube.com/watch?v=62Gi4okn2kg&list=PLvT7fd9OiI9U2P1sZTfz2Hhc_H6qIVrXm&ab_channel=EOOpenScience',
            description: 
`Prof. Stefano Tebaldini (Politecnico di Milano, Italy) leads this introductory theory session about the basics of SAR and SAR Tomography (TomoSAR).

Check out the other Polarimetric SAR lessons in this playlist, to learn more about the principles of Polarimetry, Interferometric Polarimetry, SAR Tomography, and its applications.`
        }
    }
]