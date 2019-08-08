# FrontKanban

* [Kanban Projects Management Extension](https://github.com/notrinos/FrontKanban) for [FrontAccounting](http://frontaccounting.com/)
* [Forum Discussion](http://frontaccounting.com/punbb/viewtopic.php?id=7162)
* [DEMO](http://notrinos.com/fa/index.php)

Requirement
-----------
- FrontAccounting 2.4.x

Installation
------------
1. Rename folder `FrontKanban-master` to `kanban` then copy folder to the FA modules directory.
2. For FrontAccounting versions released from 15/Dec/2017 up to now: just install and active normally. For the earlier versions, do the following:

- Comment out block of codes from lines 215 to 220 of `admin/inst_module.php`.
- Install and active the module.
- Uncomment lines 215-220 of `admin/inst_module.php`.
