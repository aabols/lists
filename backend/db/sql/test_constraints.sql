select 'Data before update:' AS '';

select * from `lists`.`Boards`;
select * from `lists`.`Lists`;
select * from `lists`.`Items`;

update `lists`.`Boards` set `BoardId` = 'board1t' where `BoardId` = 'board1';
update `lists`.`Lists` set `ListId` = 'list1t' where `ListId` = 'list1';

select 'Data after update:' AS '';
select * from `lists`.`Boards`;
select * from `lists`.`Lists`;
select * from `lists`.`Items`;
