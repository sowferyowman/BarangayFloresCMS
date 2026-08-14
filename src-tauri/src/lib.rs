use rusqlite::Connection;
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

fn db_path(app: &AppHandle) -> Result<PathBuf, String> {
  let dir=app.path().app_data_dir().map_err(|e| e.to_string())?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join("barangay_flores.db"))
}
fn open(app:&AppHandle)->Result<Connection,String>{let c=Connection::open(db_path(app)?).map_err(|e|e.to_string())?;c.execute_batch("PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS people(id INTEGER PRIMARY KEY, first_name TEXT NOT NULL,middle_name TEXT,last_name TEXT NOT NULL,gender TEXT NOT NULL,date_of_birth TEXT NOT NULL,contact_number TEXT NOT NULL,house_building_number TEXT,street TEXT,barangay TEXT NOT NULL,city_municipality TEXT NOT NULL,region TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS cases(id INTEGER PRIMARY KEY,case_number TEXT UNIQUE NOT NULL,nature_of_case TEXT NOT NULL,case_description TEXT NOT NULL,place_of_incident TEXT NOT NULL,date_of_incident TEXT NOT NULL,time_of_incident TEXT,date_of_lupon_hearing TEXT NOT NULL,complainant_id INTEGER NOT NULL REFERENCES people(id),respondent_id INTEGER NOT NULL REFERENCES people(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);").map_err(|e|e.to_string())?;Ok(c)}
#[tauri::command]
fn database_status(app:AppHandle)->Result<String,String>{open(&app)?;Ok(db_path(&app)?.display().to_string())}
#[tauri::command]
fn backup_database(app:AppHandle, destination:String)->Result<(),String>{let source=open(&app)?;let mut target=Connection::open(destination).map_err(|e|e.to_string())?;let backup=rusqlite::backup::Backup::new(&source,&mut target).map_err(|e|e.to_string())?;backup.run_to_completion(100,std::time::Duration::from_millis(50),None).map_err(|e|e.to_string())}
#[tauri::command]
fn restore_database(app:AppHandle, source:String)->Result<(),String>{let mut input=Connection::open(source).map_err(|e|e.to_string())?;let mut target=open(&app)?;let backup=rusqlite::backup::Backup::new(&input,&mut target).map_err(|e|e.to_string())?;backup.run_to_completion(100,std::time::Duration::from_millis(50),None).map_err(|e|e.to_string())}
pub fn run(){tauri::Builder::default().plugin(tauri_plugin_dialog::init()).plugin(tauri_plugin_fs::init()).invoke_handler(tauri::generate_handler![database_status,backup_database,restore_database]).run(tauri::generate_context!()).expect("unable to run application");}
