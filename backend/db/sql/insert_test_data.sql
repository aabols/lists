insert into `lists`.`Boards`
	(`BoardId`,	`BoardName`,	`ModifiedOn`,	`SeqNo`,	`Active`) values
	('board1',	'Board 1',	'1',		'0',		'1');

insert into `lists`.`Lists`
	(`ListId`,	`ListName`,	`ModifiedOn`,	`SeqNo`,	`Active`,	`BoardId`) values
	('list1',	'List 1',	'2',		'0',		'1',		'board1');

insert into `lists`.`Items`
	(`ItemId`,	`ItemName`,	`ModifiedOn`,	`SeqNo`,	`Active`,	`ListId`,	`ItemState`) values
	('item1',	'Item 1',	'3',		'0',		'1',		'list1',	'0');
