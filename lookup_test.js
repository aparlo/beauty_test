db.users.aggregate([
    {$unwind: "$uslugi"},
    {
        $lookup:{
          from: "categories",
          localField: "uslugi.name",
          foreignField: "_id",
          as: "cats"
        }
      },
      {$unwind: "$cats"},
     {
        $lookup:{
          from: "uslugi",
          localField: "cats.sub_cat",
          foreignField: "_id",
          as: "cats.sub_cat"
     }
    }
])