// import { MigrationInterface, QueryRunner } from "typeorm";
// import { SubjectEntity, SubjectType } from "../../entity/subject.entity";
// import { SubjectTagEntity } from "../../entity/subject-tag.entity";

// export class Subjects1720681571222 implements MigrationInterface {
//     private tags: Partial<SubjectTagEntity>[] = [
//         { name: "dummy" },
//         { name: "good" },
//         { name: "evil" },
//     ];

//     private subjects: Partial<SubjectEntity>[] = [
//         { name: "tst_dummy1", type: SubjectType.PERSON, short_description: "I am number 1", long_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tincidunt nulla libero, ut volutpat nunc finibus in. Ut suscipit quam laoreet facilisis mattis. Etiam eget venenatis nulla, sed faucibus elit. Donec iaculis convallis massa, ut commodo nulla aliquam posuere. Pellentesque volutpat porttitor velit vel maximus. Suspendisse potenti. Aenean eu quam a est elementum lobortis varius ac purus. Aliquam dictum risus eu metus varius fringilla. Vivamus sit amet fringilla tellus." },
//         { name: "tst_dummy2", type: SubjectType.PLACE,  short_description: "I am number 2", long_description: "Nullam fringilla in mi quis ultricies. Nunc suscipit a eros a tristique. Curabitur ultrices accumsan neque, id egestas lorem congue eu. Praesent ultricies magna urna, quis vehicula diam hendrerit sed. Vestibulum at nisl fringilla, euismod metus ac, suscipit felis. Donec metus dolor, iaculis quis quam non, laoreet ultricies quam. Donec pretium lacinia convallis. Ut semper mauris eu enim bibendum, id sollicitudin eros dignissim. Aliquam pretium sed nunc et varius. Nam hendrerit convallis quam, aliquam mattis neque vestibulum eu. Sed nec ex sed magna placerat condimentum nec nec diam. Proin consectetur massa quis egestas gravida. In tincidunt molestie nisi sit amet tincidunt. Cras blandit commodo ante ac scelerisque. Pellentesque aliquet urna et nisl auctor efficitur. Proin turpis lacus, aliquam a lacinia nec, venenatis eu lacus." },
//         { name: "tst_dummy3", type: SubjectType.THING,  short_description: "I am number 3", long_description: "Phasellus tincidunt sem libero, in auctor ex posuere ac. Mauris consequat porta sollicitudin. Cras tempor sed ligula at suscipit. Curabitur hendrerit pulvinar risus, sed facilisis dolor varius id. Etiam euismod condimentum convallis. Vivamus viverra vestibulum leo, ut fermentum odio auctor id. Donec orci sem, dapibus eu pretium et, fringilla ut lectus. Aliquam a sem euismod, sollicitudin felis nec, blandit leo. Ut et nunc eget ipsum viverra hendrerit ut at dui. In consectetur a libero eget maximus. Interdum et malesuada fames ac ante ipsum primis in faucibus." },
//         { name: "tst_dummy4", type: SubjectType.IDEA,   short_description: "I am number 4", long_description: "Nunc sapien nibh, dignissim eu lacus ut, ullamcorper pellentesque est. Suspendisse et aliquet erat. Duis pulvinar dapibus mauris ut interdum. Fusce et tortor quis augue aliquam fringilla. Fusce suscipit arcu sit amet commodo eleifend. Pellentesque scelerisque hendrerit nulla et mollis. Nulla non malesuada ligula." },
//         { name: "tst_dummy5", type: SubjectType.EVENT,  short_description: "I am number 5", long_description: "Aliquam aliquet efficitur leo interdum consequat. Fusce suscipit, eros a pulvinar vehicula, mauris ex luctus odio, egestas fringilla velit dolor nec sapien. Aenean pulvinar dictum nisi, nec ornare nibh egestas nec. Duis congue lacus at justo facilisis, vitae lobortis mauris ultricies. Nullam non malesuada purus. Vestibulum euismod malesuada purus, in pretium nibh hendrerit quis. Aliquam et consectetur arcu, vitae maximus nulla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed elementum ligula a ultrices faucibus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam ut mattis ante, sit amet ornare turpis. Cras vitae dui eu eros volutpat interdum. Duis vel dictum enim, nec tincidunt justo. Praesent pellentesque quam nec eros commodo, convallis bibendum nibh porttitor." },
//         { name: "tst_dummy6", type: SubjectType.PERSON, short_description: "I am number 6", long_description: "Vivamus pellentesque eget lorem vel ornare. Aenean vel risus sollicitudin, convallis dui eget, dictum libero. Ut pulvinar leo vitae nulla efficitur gravida. Nam sagittis nisl quis tincidunt faucibus. Donec vestibulum, magna non tristique accumsan, ipsum ex sodales tortor, id sagittis risus quam at ex. Donec et pharetra est. Cras posuere est est. Sed hendrerit mauris a sodales viverra. Etiam sagittis pretium tellus ut rutrum. Nullam risus nulla, semper nec porta eu, scelerisque in tellus. Nullam tempus venenatis elit ac euismod." },
//         { name: "tst_dummy7", type: SubjectType.PERSON, short_description: "I am number 7", long_description: "Nam fringilla urna non auctor gravida. Suspendisse risus lacus, sodales ac tellus in, consequat consequat magna. In feugiat orci erat, id hendrerit lacus consectetur ut. Etiam condimentum ornare lectus vitae porta. Aenean aliquam tempor iaculis. Mauris lacus ante, malesuada vel interdum non, interdum ut justo. Nunc eu tellus commodo, dictum nibh vel, mollis velit. Proin nec tellus augue. Etiam sed porttitor sem. Nunc sed justo imperdiet, luctus lorem et, dignissim lorem. Suspendisse elementum sem felis. Praesent lacinia quam nec congue tincidunt. Suspendisse sapien massa, fermentum non tempor vel, dictum id risus. Etiam placerat fermentum mattis. Praesent posuere finibus urna vitae ornare." },
//         { name: "tst_dummy8", type: SubjectType.PERSON, short_description: "I am number 8", long_description: "Curabitur condimentum felis at leo elementum, scelerisque cursus est vestibulum. Integer turpis massa, eleifend nec ex ac, tristique elementum tellus. Suspendisse malesuada ex enim, cursus consequat ante ullamcorper in. Proin eleifend ullamcorper placerat. Etiam quis dui turpis. Sed porta accumsan sapien a hendrerit. Suspendisse a purus fringilla, lacinia erat ac, consequat purus." },
//         { name: "tst_dummy9", type: SubjectType.PERSON, short_description: null,            long_description: "Just a bunch of dummy data." },
//     ];

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         const [{ id: defaultUser }] = await queryRunner.manager.query(`SELECT id FROM "app"."user" WHERE name = 'system' LIMIT 1`);
//         const [{id: dummyTagId }, { id: goodTagId }, { id: evilTagId }] = await queryRunner.manager.save(SubjectTagEntity, this.tags);
//         await queryRunner.manager.save(SubjectEntity, this.subjects.map((subj, i) => ({
//             ...subj,
//             created_by: defaultUser,
//             tags: subj.type === SubjectType.PERSON ? [{id: dummyTagId }, { id: i % 2 ? goodTagId : evilTagId }] : [{id: dummyTagId }]
//         })));
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`DELETE FROM "app"."subject_tag_mapping"`);
//         await queryRunner.query(`DELETE FROM "app"."subject_tag"`);
//         await queryRunner.query(`DELETE FROM "app"."subject"`);
//     }
// }
