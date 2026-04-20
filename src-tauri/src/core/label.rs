#[tauri::command]
pub async fn set_label_text(_text: String) -> Result<(), String> {
    Ok(())
}
