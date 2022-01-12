create database if not exists `lists`;

create table if not exists `lists`.`Boards` (
	`BoardId` varchar(36) NOT NULL,
	`BoardName` varchar(100) NOT NULL,
	`ModifiedOn` bigint(20) NOT NULL,
	`SeqNo` int(11) NOT NULL,
	`Active` tinyint(4) NOT NULL DEFAULT '1',
	PRIMARY KEY (`BoardId`)
);

create table if not exists `lists`.`Lists` (
	`ListId`	varchar(36)	NOT NULL,
	`ListName`	varchar(100)	NOT NULL,
	`BoardId`	varchar(36)	NOT NULL,
	`ModifiedOn`	bigint(20)	NOT NULL,
	`SeqNo`		int(11)		NOT NULL,
	`Active`	tinyint(4)	NOT NULL	DEFAULT '1',
	PRIMARY KEY (`ListId`),
	KEY `BoardId` (`BoardId`)
);

alter table `lists`.`Lists`
	ADD CONSTRAINT `Lists_Boards` FOREIGN KEY (`BoardId`) REFERENCES `lists`.`Boards` (`BoardId`) ON DELETE CASCADE ON UPDATE CASCADE;

create table if not exists `lists`.`Items` (
	`ItemId`	varchar(36)	NOT NULL,
	`ItemName`	varchar(100)	NOT NULL,
	`ListId`	varchar(36)	NOT NULL,
	`ItemState`	tinyint(1)	NOT NULL,
	`ModifiedOn`	bigint(20)	NOT NULL,
	`SeqNo`		int(11)		NOT NULL,
	`Active`	tinyint(4)	NOT NULL	DEFAULT '1',
	PRIMARY KEY (`ItemId`),
	KEY `ListId` (`ListId`)
);

alter table `lists`.`Items`
	ADD CONSTRAINT `Items_Lists` FOREIGN KEY (`ListId`) REFERENCES `lists`.`Lists` (`ListId`) ON DELETE CASCADE ON UPDATE CASCADE;

create table if not exists `lists`.`Users` (
	`UserName`	varchar(100)	NOT NULL,
	`UserPin`	varchar(255)	NOT NULL,
	UNIQUE KEY `UniqueUserName` (`UserName`)
);

create table if not exists `lists`.`Permissions` (
	`ResourceId`		varchar(36)	NOT NULL,
	`UserName`		varchar(100)	NOT NULL,
	`PermissionTypes`	varchar(50)	NOT NULL
);
