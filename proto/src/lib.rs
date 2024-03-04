#[derive(Debug)]
pub struct PomoflowMessage {
    pub message_type: u8,
    pub data_length: u8,
    pub payload: Vec<u8>,
}

impl PomoflowMessage {
    pub fn deserialize_message(serialized_data: &Vec<u8>) -> Option<PomoflowMessage> {
        if serialized_data.len() < 2 {
            return None;
        }

        let message_type = serialized_data[0];
        let data_length = serialized_data[1];

        if serialized_data.len() < (2 + data_length as usize) {
            return None;
        }

        let payload = serialized_data[2..(2 + data_length as usize)].to_vec();

        Some(PomoflowMessage {
            message_type,
            data_length,
            payload,
        })
    }

    pub fn serialize_message(
        is_collaborative: bool,
        num_people: u16,
        remaining_timer: u32,
    ) -> Vec<u8> {
        let message_type: u8 = 1;

        let mut payload = Vec::new();
        payload.push(if is_collaborative { 1 } else { 0 });
        payload.extend(num_people.to_be_bytes());
        payload.extend(&remaining_timer.to_be_bytes());

        let data_length: u8 = payload.len() as u8;

        let message = PomoflowMessage {
            message_type,
            data_length,
            payload,
        };

        let mut serialized_data = Vec::new();
        serialized_data.push(message.message_type);
        serialized_data.push(message.data_length);
        serialized_data.extend(&message.payload);

        serialized_data
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serialize_message_non_collab() {
        let payload = PomoflowMessage::serialize_message(false, 1, 1500);
        assert_eq!(payload, vec![1, 7, 0, 0, 1, 0, 0, 5, 220]);
    }

    #[test]
    fn test_serialize_message_collab() {
        let payload = PomoflowMessage::serialize_message(true, 256, 1500);
        assert_eq!(payload, vec![1, 7, 1, 1, 0, 0, 0, 5, 220]);
    }

    #[test]
    fn test_deserialize_message() {
        let payload = vec![1, 6, 0, 1, 0, 0, 5, 220];
        let message = PomoflowMessage::deserialize_message(&payload).unwrap();
        assert_eq!(message.message_type, 1);
        assert_eq!(message.data_length, 6);
        assert_eq!(message.payload, vec![0, 1, 0, 0, 5, 220]);
    }

    #[test]
    fn test_deserialize_message_collab() {
        let payload = vec![1, 7, 0, 1, 1, 0, 0, 5, 220];
        let message = PomoflowMessage::deserialize_message(&payload).unwrap();
        assert_eq!(message.message_type, 1);
        assert_eq!(message.data_length, 7);
        assert_eq!(message.payload, vec![0, 1, 1, 0, 0, 5, 220]);
    }
}
